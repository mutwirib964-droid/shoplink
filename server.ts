import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { hashbackService } from './server/hashbackService.ts';
import { handleAIAssistantQuery } from './server/aiService.ts';

dotenv.config();

// In-memory store for server-side transactions & webhook cache
const processedWebhooks = new Set<string>();
const serverPaymentRecords: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // =========================================================================
  // API ROUTES
  // =========================================================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'ShopLink Kenya API',
      timestamp: new Date().toISOString(),
    });
  });

  // Safe configuration status (no credentials exposed)
  app.get('/api/config', (req, res) => {
    res.json({
      hashbackLiveConfigured: hashbackService.isLiveConfigured(),
      hashbackMerchantId: process.env.HASHBACK_MERCHANT_ID ? 'Configured' : 'Missing',
      supabaseConfigured: Boolean(process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('your-project')),
      environment: process.env.NODE_ENV || 'development',
      currency: 'KSh',
    });
  });

  // Hashback M-Pesa STK Push Payment Initiation
  app.post('/api/payments/hashback/initiate', async (req, res) => {
    try {
      const { orderId, orderNumber, amount, phoneNumber, customerName, businessId, description } = req.body;

      if (!orderId || !amount || !phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters: orderId, amount, phoneNumber.',
        });
      }

      const result = await hashbackService.initiateStkPush({
        orderId,
        orderNumber: orderNumber || `SLK-${Date.now().toString().slice(-4)}`,
        amount: Number(amount),
        phoneNumber,
        customerName: customerName || 'Valued Customer',
        businessId: businessId || 'default',
        description,
      });

      // Record transaction initiation
      serverPaymentRecords.push({
        orderId,
        orderNumber,
        gatewayTransactionId: result.gatewayTransactionId,
        amount,
        phoneNumber,
        status: result.status,
        createdAt: new Date().toISOString(),
      });

      return res.json(result);
    } catch (err: any) {
      console.error('Error initiating Hashback payment:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while initiating payment.',
        error: err.message,
      });
    }
  });

  // Hashback Webhook Callback Endpoint
  // Receives post-payment confirmation from Hashback servers
  app.post('/api/payments/hashback/callback', async (req, res) => {
    try {
      const signature = req.headers['x-hashback-signature'] as string | undefined;
      const payload = req.body;

      console.log('Received Hashback webhook callback:', JSON.stringify(payload));

      // 1. Signature Verification
      const isValid = hashbackService.verifyWebhookSignature(payload, signature);
      if (!isValid) {
        console.warn('Invalid Hashback webhook signature detected.');
        return res.status(401).json({ status: 'error', message: 'Invalid signature' });
      }

      const transactionId = payload.transaction_id || payload.id || `HB-${Date.now()}`;
      const orderReference = payload.order_reference || payload.order_id;
      const status = (payload.status || '').toUpperCase();
      const mpesaReceipt = payload.mpesa_receipt_number || payload.mpesa_receipt || `RHB${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      // 2. Idempotency Check
      if (processedWebhooks.has(transactionId)) {
        console.log(`Duplicate webhook ignored for transaction: ${transactionId}`);
        return res.json({ status: 'ignored', message: 'Webhook already processed' });
      }

      processedWebhooks.add(transactionId);

      // 3. Status Verification
      const isSuccess = status === 'SUCCESS' || status === 'COMPLETED' || payload.result_code === 0 || payload.result_code === '0';

      console.log(`Hashback Payment Verified: Order ${orderReference} is ${isSuccess ? 'PAID' : 'FAILED'}`);

      return res.json({
        status: 'ok',
        orderReference,
        transactionId,
        mpesaReceipt: isSuccess ? mpesaReceipt : null,
        paymentStatus: isSuccess ? 'successful' : 'failed',
        processedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Error processing Hashback callback:', err);
      return res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // Simulated Webhook Trigger for developer/preview testing
  app.post('/api/payments/hashback/simulate-callback', (req, res) => {
    const { orderId, status = 'SUCCESS' } = req.body;
    const fakeMpesaReceipt = `RHB${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    
    return res.json({
      status: 'ok',
      orderId,
      paymentStatus: status === 'SUCCESS' ? 'successful' : 'failed',
      mpesaReceipt: fakeMpesaReceipt,
      timestamp: new Date().toISOString(),
    });
  });

  // AI Assistant endpoint - answers queries & directs to live WhatsApp agent on 0794990624
  app.post('/api/ai/assistant', async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'A message query is required.',
        });
      }

      const result = await handleAIAssistantQuery(message, history || []);
      return res.json(result);
    } catch (err: any) {
      console.error('Error in /api/ai/assistant route:', err);
      return res.status(500).json({
        success: false,
        message: 'Error processing AI assistant request.',
        assistancePhone: '0794990624',
        assistanceWhatsAppUrl: 'https://wa.me/254794990624?text=Hello%20ShopLink%20Support%2C%20I%20need%20assistance.',
      });
    }
  });

  // =========================================================================
  // VITE DEV MIDDLEWARE / STATIC SERVING
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ShopLink Kenya server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
