/**
 * ShopLink Kenya - Official Customer & Merchant Assistance Configuration
 * Support Helpline & WhatsApp Integration
 */

export const ASSISTANCE_CONFIG = {
  // Official assistance phone number
  phoneNumber: '0794990624',
  
  // International format for WhatsApp API (E.164 without plus)
  phoneInternational: '254794990624',
  
  // Human-friendly display format
  phoneDisplay: '0794 990 624',
  phoneDisplayInternational: '+254 794 990 624',
  
  supportHours: 'Monday – Sunday: 7:00 AM – 10:00 PM EAT',
  responseTime: 'Typically replies in under 5 minutes',
  agentName: 'ShopLink Support Agent',
  
  // Quick Inquiry Templates
  quickQuestions: [
    {
      id: 'create-shop',
      label: 'Create My Online Store',
      icon: 'Store',
      message: 'Hello ShopLink Agent, I want to create an online shop for my business. Please guide me through setting it up.',
    },
    {
      id: 'mpesa-help',
      label: 'M-Pesa / Hashback Help',
      icon: 'Smartphone',
      message: 'Hello ShopLink Support, I have a question regarding M-Pesa STK push payments and Hashback integration.',
    },
    {
      id: 'order-help',
      label: 'Order & Delivery Tracking',
      icon: 'Truck',
      message: 'Hello ShopLink Team, I need assistance with an order or delivery inquiry.',
    },
    {
      id: 'merchant-subscription',
      label: 'Plans & Pricing (Free / Pro)',
      icon: 'CreditCard',
      message: 'Hello ShopLink, I want to learn more about the Business & Pro subscription plans for merchants.',
    },
    {
      id: 'human-agent',
      label: 'Talk to Live Agent',
      icon: 'MessageCircle',
      message: 'Hello ShopLink Support Agent, I would like to speak directly with a live support representative.',
    },
  ],
};

/**
 * Generates a direct WhatsApp click-to-chat URL targeting 0794990624
 */
export function buildWhatsAppUrl(message?: string): string {
  const defaultMessage = 'Hello ShopLink Kenya Support, I need assistance with my online shop or an order.';
  const encodedText = encodeURIComponent(message?.trim() || defaultMessage);
  return `https://wa.me/${ASSISTANCE_CONFIG.phoneInternational}?text=${encodedText}`;
}

/**
 * Direct phone dialer URL
 */
export function buildTelUrl(): string {
  return `tel:+${ASSISTANCE_CONFIG.phoneInternational}`;
}
