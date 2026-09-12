/**
 * ShopLink Kenya — Hashback M-Pesa Payment Service
 * 
 * Official integration abstraction for Hashback (https://hashback.io)
 * All credentials are read from server environment variables.
 * 
 * Flow:
 * 1. initiateStkPush() sends payment initiation to Hashback
 * 2. processCallbackWebhook() receives and validates Hashback's webhook
 * 3. Idempotent payment verification and order status transition
 */

import crypto from 'crypto';

export interface HashbackInitiateParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  phoneNumber: string; // Formatted 254XXXXXXXXX
  customerName: string;
  businessId: string;
  description?: string;
}

export interface HashbackInitiateResult {
  success: boolean;
  status: 'pending' | 'failed';
  gatewayTransactionId: string;
  checkoutRequestId?: string;
  message: string;
  isSimulated?: boolean;
}

export interface HashbackWebhookPayload {
  merchant_id?: string;
  transaction_id: string; // Hashback transaction ID
  order_reference: string; // our orderId or orderNumber
  amount: number;
  phone_number: string;
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  mpesa_receipt_number?: string;
  result_code?: number | string;
  result_desc?: string;
  timestamp?: string;
  signature?: string;
}

export class HashbackService {
  private apiKey: string;
  private secret: string;
  private merchantId: string;
  private callbackUrl: string;
  private apiBaseUrl: string;

  constructor() {
    this.apiKey = process.env.HASHBACK_API_KEY || '';
    this.secret = process.env.HASHBACK_SECRET || '';
    this.merchantId = process.env.HASHBACK_MERCHANT_ID || '';
    this.callbackUrl = process.env.HASHBACK_CALLBACK_URL || 'http://localhost:3000/api/payments/hashback/callback';
    
    // Hashback official base URL placeholder
    // If testing in sandbox or production, set HASHBACK_BASE_URL
    this.apiBaseUrl = process.env.HASHBACK_BASE_URL || 'https://api.hashback.io/v1';
  }

  /**
   * Normalizes Kenyan phone numbers to the standard 254XXXXXXXXX format
   * Supports: 07XXXXXXXX, 01XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX
   */
  public normalizePhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\s+/g, '').replace(/-/g, '').replace(/\+/g, '');
    if (cleaned.startsWith('0') && (cleaned.length === 10)) {
      return '254' + cleaned.substring(1);
    }
    if (cleaned.startsWith('254') && cleaned.length === 12) {
      return cleaned;
    }
    if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('1'))) {
      return '254' + cleaned;
    }
    return cleaned;
  }

  /**
   * Checks if live Hashback credentials are configured
   */
  public isLiveConfigured(): boolean {
    return Boolean(this.apiKey && this.secret && this.merchantId && !this.apiKey.includes('your-'));
  }

  /**
   * Initiates an M-Pesa STK push via Hashback
   */
  public async initiateStkPush(params: HashbackInitiateParams): Promise<HashbackInitiateResult> {
    const formattedPhone = this.normalizePhoneNumber(params.phoneNumber);

    // Validate phone number format for Kenya (2547... or 2541...)
    const kePhoneRegex = /^254(7|1)\d{8}$/;
    if (!kePhoneRegex.test(formattedPhone)) {
      return {
        success: false,
        status: 'failed',
        gatewayTransactionId: '',
        message: 'Invalid Kenyan phone number. Format should be 07XXXXXXXX or 01XXXXXXXX.'
      };
    }

    if (params.amount <= 0) {
      return {
        success: false,
        status: 'failed',
        gatewayTransactionId: '',
        message: 'Amount must be greater than KSh 0.'
      };
    }

    // If live credentials are provided, call Hashback API
    if (this.isLiveConfigured()) {
      try {
        const payload = {
          merchant_id: this.merchantId,
          order_id: params.orderId,
          order_number: params.orderNumber,
          amount: Math.round(params.amount),
          phone_number: formattedPhone,
          callback_url: this.callbackUrl,
          customer_name: params.customerName,
          description: params.description || `Payment for order ${params.orderNumber}`
        };

        const response = await fetch(`${this.apiBaseUrl}/payments/mpesa-stk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Merchant-ID': this.merchantId
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && (data.status === 'pending' || data.success)) {
          return {
            success: true,
            status: 'pending',
            gatewayTransactionId: data.transaction_id || data.id || `HB-${Date.now()}`,
            checkoutRequestId: data.checkout_request_id,
            message: 'STK prompt sent to customer phone. Awaiting PIN entry.'
          };
        } else {
          return {
            success: false,
            status: 'failed',
            gatewayTransactionId: '',
            message: data.message || 'Hashback could not initiate STK push.'
          };
        }
      } catch (err: any) {
        console.error('Hashback API error:', err);
        return {
          success: false,
          status: 'failed',
          gatewayTransactionId: '',
          message: 'Failed to communicate with Hashback gateway: ' + (err.message || 'Network error')
        };
      }
    }

    // Sandbox / Test Mode when API keys are not yet configured in environment
    // Generates a mock transaction reference with explicit indicator
    const mockTxId = `HB-SANDBOX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return {
      success: true,
      status: 'pending',
      gatewayTransactionId: mockTxId,
      checkoutRequestId: `ws_CO_${Date.now()}`,
      message: 'STK Push initiated in Hashback Sandbox/Test mode. Enter PIN on test prompt.',
      isSimulated: true
    };
  }

  /**
   * Validates Hashback webhook signature
   */
  public verifyWebhookSignature(payload: any, signatureHeader?: string): boolean {
    if (!this.secret || this.secret.includes('your-')) {
      // In sandbox/testing mode without secret, accept payload
      return true;
    }

    if (!signatureHeader) {
      return false;
    }

    try {
      const computedSignature = crypto
        .createHmac('sha256', this.secret)
        .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signatureHeader),
        Buffer.from(computedSignature)
      );
    } catch {
      return false;
    }
  }
}

export const hashbackService = new HashbackService();
