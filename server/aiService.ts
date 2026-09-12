import { GoogleGenAI } from '@google/genai';

const ASSISTANCE_PHONE = '0794990624';
const ASSISTANCE_INTL = '254794990624';

let genAIClient: GoogleGenAI | null = null;

function getGenAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

const SYSTEM_INSTRUCTION = `You are the official AI Support Assistant for ShopLink Kenya (https://shoplink.co.ke), Kenya's premier SaaS platform empowering small and medium enterprises (SMEs), Instagram sellers, and WhatsApp merchants to run automated online stores with M-Pesa payments via Hashback.

Your role:
1. Answer questions about:
   - Creating a store on ShopLink (takes under 2 minutes, get a unique direct store link like shoplink.co.ke/?shop=my-store).
   - Direct store links: Each merchant has a unique link they can share on WhatsApp Status, Instagram Bio, TikTok, or print as a QR code to direct customers straight to their shop.
   - Hashback M-Pesa STK Push payments: Customers enter M-Pesa PIN on their phone, instant payment confirmation, automatic inventory deduction.
   - WhatsApp integration: Instant "Share on WhatsApp" and "Contact Business on WhatsApp" buttons for every store and product.
   - Pricing & Plans: FREE plan (up to 10 products), BUSINESS plan (KSh 999/mo, 100 products, full analytics), PRO plan (KSh 1,999/mo, unlimited products, VIP priority).
   - Delivery across Nairobi and Kenya: Merchants configure standard delivery fees (e.g. KSh 200 within Nairobi).
   - Order management and tracking for buyers and sellers.
2. Direct anyone needing live human help to our official WhatsApp assistance desk:
   - Tell users they can click the "Chat on WhatsApp" button to connect directly with a live human support agent on WhatsApp anytime.
   - IMPORTANT: Do NOT display or print raw phone numbers in the text of your response; users will see and use the phone number automatically once directed to WhatsApp.
3. Be friendly, concise, professional, and knowledgeable about the Kenyan e-commerce landscape (M-Pesa, KSh, Nairobi pick-up points, WhatsApp commerce). Keep answers under 3-4 short paragraphs so users on mobile can read easily.`;

/**
 * Intelligent local fallback knowledge-base when GEMINI_API_KEY is not configured
 */
function getLocalSmartResponse(userMessage: string): { reply: string; suggestedTopic?: string } {
  const query = userMessage.toLowerCase();

  if (query.includes('agent') || query.includes('human') || query.includes('call') || query.includes('talk') || query.includes('person') || query.includes('contact')) {
    return {
      reply: `Our official ShopLink human support agents are available to assist you directly on WhatsApp!\n\nYou can click the **"Chat with Agent on WhatsApp"** button below to open a live WhatsApp conversation immediately. Our team typically replies within 2–5 minutes during support hours (7 AM – 10 PM EAT).`,
      suggestedTopic: 'human-agent',
    };
  }

  if (query.includes('create') || query.includes('register') || query.includes('start') || query.includes('open shop') || query.includes('set up')) {
    return {
      reply: `Creating your online store on ShopLink Kenya takes under 2 minutes!\n\n1. Click **"Create Shop"** in the top navigation.\n2. Enter your business name, phone number, location (e.g., Nairobi - CBD), and set your delivery fee.\n3. We immediately generate your unique store link (e.g., \`shoplink.co.ke/?shop=your-name\`).\n4. Add your products with images and prices, and start sharing your unique link directly on WhatsApp chats, Status, and your Instagram bio!\n\nNeed personalized onboarding help? Click the WhatsApp button below to chat with our onboarding desk.`,
      suggestedTopic: 'create-shop',
    };
  }

  if (query.includes('link') || query.includes('url') || query.includes('direct') || query.includes('unique')) {
    return {
      reply: `Yes! Every merchant on ShopLink Kenya receives a **unique, dedicated store link** (for example: \`shoplink.co.ke/?shop=your-business-name\` or \`shoplink.co.ke/shop/your-business-name\`).\n\n• **Direct Access**: When customers tap your link from your WhatsApp Status, Instagram Bio, TikTok, or SMS, they land directly on your store—viewing your brand, products, categories, and Lipa na M-Pesa checkout.\n• **Printable QR Code**: You can also download a store QR code from your merchant dashboard to print on your packaging or place on your shop counter!\n• **One-Click WhatsApp Sharing**: Easily share your store with ready-to-send Kenyan promotional messages.`,
      suggestedTopic: 'create-shop',
    };
  }

  if (query.includes('mpesa') || query.includes('m-pesa') || query.includes('hashback') || query.includes('pay') || query.includes('stk') || query.includes('pin')) {
    return {
      reply: `ShopLink Kenya is integrated with the **Hashback M-Pesa Gateway** for seamless Kenyan payments:\n\n• **Instant STK Push**: When a customer checks out, an M-Pesa prompt automatically pops up on their phone requesting their PIN.\n• **Zero Manual Confirmations**: Once authorized, the webhook marks the order as PAID instantly and auto-decrements stock.\n• **Transparent Receipts**: An official M-Pesa transaction reference is issued to both buyer and seller.\n\nHave a question about your M-Pesa payment? Click **"Chat on WhatsApp"** below to reach our billing support.`,
      suggestedTopic: 'mpesa-help',
    };
  }

  if (query.includes('price') || query.includes('plan') || query.includes('subscription') || query.includes('cost') || query.includes('free') || query.includes('fee')) {
    return {
      reply: `ShopLink Kenya offers 3 straightforward merchant tiers:\n\n• **FREE Plan (KSh 0/mo)**: Up to 10 products, custom unique store link, WhatsApp catalog sharing, basic order management.\n• **BUSINESS Plan (KSh 999/mo)**: Up to 100 products, Hashback M-Pesa checkout, sales analytics, customer CRM, lower transaction fees.\n• **PRO Plan (KSh 1,999/mo)**: Unlimited products, priority SEO & marketplace featuring, dedicated VIP WhatsApp support.\n\nReady to upgrade or have billing questions? Connect with our team directly on WhatsApp.`,
      suggestedTopic: 'merchant-subscription',
    };
  }

  if (query.includes('delivery') || query.includes('shipping') || query.includes('track') || query.includes('order')) {
    return {
      reply: `Here's how order delivery and tracking work on ShopLink:\n\n• **Doorstep Delivery**: Merchants set their own standard delivery fees (e.g. KSh 200 within Nairobi). Customers provide their delivery estate and house directions during checkout.\n• **Real-Time Tracking**: Customers can check **"My Orders"** at any time to monitor status from *Paid* to *Processing*, *Shipped*, and *Delivered*.\n• **Direct WhatsApp Notifications**: You can also notify the store owner or contact our support team on WhatsApp for urgent courier follow-ups.`,
      suggestedTopic: 'order-help',
    };
  }

  if (query.includes('whatsapp') || query.includes('share')) {
    return {
      reply: `ShopLink is tailored specifically for Kenyan WhatsApp commerce!\n\nEvery product and shop page includes instant **"Share to WhatsApp"** and **"Contact Business on WhatsApp"** links. Customers can order directly through your unique link without installing any app.\n\nFor platform support, you can also reach our official WhatsApp assistance desk anytime by clicking the WhatsApp button below.`,
      suggestedTopic: 'human-agent',
    };
  }

  return {
    reply: `Hello! I'm the ShopLink Kenya AI Assistant. I can help you with creating an online store, getting your unique shop link, setting up M-Pesa Hashback payments, adding products, order tracking, and pricing.\n\nIf you would like to speak directly with our team, you can click the **"Chat on WhatsApp"** button below to start a direct WhatsApp chat with our support desk. How can I assist you today?`,
    suggestedTopic: 'human-agent',
  };
}

export async function handleAIAssistantQuery(userMessage: string, history: Array<{ role: 'user' | 'model'; text: string }> = []) {
  const client = getGenAIClient();

  if (!client) {
    // Graceful fallback to rich local knowledge base
    const local = getLocalSmartResponse(userMessage);
    return {
      success: true,
      reply: local.reply,
      suggestedTopic: local.suggestedTopic,
      source: 'local_engine',
      assistancePhone: ASSISTANCE_PHONE,
      assistanceWhatsAppUrl: `https://wa.me/${ASSISTANCE_INTL}?text=${encodeURIComponent(`Hello ShopLink Agent, I asked: "${userMessage}". Can you help me further?`)}`,
    };
  }

  try {
    // Format conversation history for Gemini
    const contents: any[] = [];
    for (const msg of history.slice(-6)) {
      contents.push({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    const text = response.text || '';

    return {
      success: true,
      reply: text,
      source: 'gemini-3.8-flash',
      assistancePhone: ASSISTANCE_PHONE,
      assistanceWhatsAppUrl: `https://wa.me/${ASSISTANCE_INTL}?text=${encodeURIComponent(`Hello ShopLink Agent, I asked: "${userMessage}". Can you assist me?`)}`,
    };
  } catch (err: any) {
    console.warn('Gemini API call failed, falling back to local smart assistant:', err.message);
    const local = getLocalSmartResponse(userMessage);
    return {
      success: true,
      reply: local.reply,
      suggestedTopic: local.suggestedTopic,
      source: 'local_fallback',
      assistancePhone: ASSISTANCE_PHONE,
      assistanceWhatsAppUrl: `https://wa.me/${ASSISTANCE_INTL}?text=${encodeURIComponent(`Hello ShopLink Agent, I asked: "${userMessage}". Can you assist me?`)}`,
    };
  }
}
