import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Phone,
  Copy,
  Check,
  Sparkles,
  Bot,
  ExternalLink,
  ChevronDown,
  RotateCcw,
  ArrowRight,
  Headphones,
  Store,
  CreditCard,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { ASSISTANCE_CONFIG, buildWhatsAppUrl, buildTelUrl } from '../lib/assistanceConfig';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestedWhatsAppText?: string;
}

export const WhatsAppAssistanceWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'ai'>('whatsapp');
  
  // Direct WhatsApp Tab state
  const [customMessage, setCustomMessage] = useState('');
  const [selectedQuickId, setSelectedQuickId] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // AI Chat Tab state
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Habari! 👋 I'm the ShopLink Kenya AI Assistant.\n\nI can instantly answer questions about setting up your online shop, configuring M-Pesa payments via Hashback, managing inventory, and tracking customer orders.\n\nNeed personalized human support? Our official live agent is always available directly on WhatsApp!`,
      timestamp: 'Just now',
      suggestedWhatsAppText: 'Hello ShopLink Support Team, I am chatting with the AI assistant and would like to speak with a human support representative.',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll AI chat
  useEffect(() => {
    if (activeTab === 'ai' && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, isOpen]);

  const handleQuickQuestionSelect = (template: typeof ASSISTANCE_CONFIG.quickQuestions[0]) => {
    setSelectedQuickId(template.id);
    setCustomMessage(template.message);
  };

  // Submit message to AI assistant
  const handleSendAiMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = aiInput.trim();
    if (!query || isAiLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setIsAiLoading(true);

    try {
      // Build history payload for context
      const history = messages
        .filter(m => m.id !== 'welcome-1')
        .map(m => ({
          role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
          text: m.text,
        }));

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, history }),
      });

      const data = await res.json();
      const replyText = data.reply || 'Our live agent is standing by to help you directly on WhatsApp.';

      const aiReplyMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedWhatsAppText: `Hello ShopLink Support Team, I was asking the AI assistant: "${query}". Could you please help me with this?`,
      };

      setMessages(prev => [...prev, aiReplyMsg]);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `I'm having trouble connecting right now, but our live support agent is actively responding directly on WhatsApp!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedWhatsAppText: `Hello ShopLink Support Team, I have a question: "${query}". Can you assist me?`,
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleClearAiChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: `Habari! 👋 Ask me any question or let me connect you directly to our WhatsApp support team.`,
        timestamp: 'Just now',
        suggestedWhatsAppText: 'Hello ShopLink Support Team, I need assistance.',
      },
    ]);
  };

  const activeWhatsAppUrl = buildWhatsAppUrl(customMessage);

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans print:hidden">
      {/* ================================================================= */}
      {/* FLOATING TRIGGER BUTTON (When collapsed)                          */}
      {/* ================================================================= */}
      {!isOpen && (
        <div className="flex items-center gap-3">
          {/* Friendly prompt bubble for visitors */}
          <div
            onClick={() => setIsOpen(true)}
            className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white shadow-xl border border-emerald-100 cursor-pointer hover:shadow-2xl transition-all animate-bounce duration-1000"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <div className="text-left">
              <p className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <span>WhatsApp & AI Help</span>
                <span className="text-emerald-700 font-semibold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">Online</span>
              </p>
              <p className="text-[10px] text-neutral-500">Live Kenyan Support Desk</p>
            </div>
          </div>

          {/* Main Floating WhatsApp Bubble */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open WhatsApp & AI Assistance"
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-600/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all focus:outline-hidden"
          >
            {/* Pulse rings */}
            <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping opacity-75 group-hover:opacity-100" />
            
            {/* WhatsApp / Chat Icon */}
            <div className="relative flex items-center justify-center">
              <MessageCircle className="w-7 h-7 fill-white/20 stroke-[2.2]" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-600 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* EXPANDED SUPPORT & AI DESK MODAL                                  */}
      {/* ================================================================= */}
      {isOpen && (
        <div className="w-[94vw] sm:w-[410px] max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-neutral-200/90 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white">
                <Headphones className="w-5 h-5 text-white" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-emerald-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold tracking-tight text-white">
                    ShopLink Assistance Desk
                  </h3>
                  <span className="text-[10px] bg-emerald-500/40 text-emerald-100 px-1.5 py-0.5 rounded-full font-bold border border-emerald-400/30">
                    Online
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-100/90 mt-0.5">
                  <MessageCircle className="w-3 h-3 text-emerald-300" />
                  <span>Direct WhatsApp Support Desk</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close widget"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="bg-neutral-100/80 p-1.5 border-b border-neutral-200 grid grid-cols-2 gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'whatsapp'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct WhatsApp</span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'ai'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Support Agent</span>
            </button>
          </div>

          {/* ============================================================= */}
          {/* TAB 1: DIRECT WHATSAPP ASSISTANCE                             */}
          {/* ============================================================= */}
          {activeTab === 'whatsapp' && (
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 max-h-[62vh]">
              {/* Official Agent Profile Card */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      WA
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-neutral-900">
                          Official WhatsApp Desk
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <p className="text-xs font-medium text-emerald-800">
                        Live Human Support • Kenya
                      </p>
                    </div>
                  </div>

                  <a
                    href={activeWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <span>Connect</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
                <div className="mt-2.5 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-800">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live & Active Now</span>
                  </span>
                  <span>{ASSISTANCE_CONFIG.responseTime}</span>
                </div>
              </div>

              {/* Quick Inquiry Buttons */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  What do you need help with?
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ASSISTANCE_CONFIG.quickQuestions.map(q => {
                    const isSelected = selectedQuickId === q.id;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => handleQuickQuestionSelect(q)}
                        className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-left ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-xs'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300'
                        }`}
                      >
                        <span>{q.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Input Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    Your Question / Message
                  </label>
                  {customMessage && (
                    <button
                      onClick={() => {
                        setCustomMessage('');
                        setSelectedQuickId(null);
                      }}
                      className="text-[10px] text-neutral-400 hover:text-neutral-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  placeholder="Type your question here (e.g. How do I setup M-Pesa for my shop? Can you help me with my store link?)..."
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none bg-neutral-50/50"
                />
              </div>

              {/* Primary Direct WhatsApp Action Button */}
              <div>
                <a
                  href={activeWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 transition-all group"
                >
                  <MessageCircle className="w-4 h-4 fill-white/20 stroke-[2.5]" />
                  <span>Chat on WhatsApp</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <p className="text-[11px] text-neutral-500 text-center mt-2">
                  Opens WhatsApp directly with our verified Kenyan assistance team.
                </p>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB 2: AI ASSISTANT CHAT (Directs to 0794990624 as Agent)      */}
          {/* ============================================================= */}
          {activeTab === 'ai' && (
            <div className="flex-1 flex flex-col max-h-[62vh]">
              {/* Chat Message Scroll Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50/60">
                <div className="flex items-center justify-between pb-1 text-[11px] text-neutral-400 border-b border-neutral-200/60">
                  <span className="flex items-center gap-1 font-medium text-emerald-700">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Assistant + Live Agent Escalation</span>
                  </span>
                  <button
                    onClick={handleClearAiChat}
                    className="flex items-center gap-1 hover:text-neutral-700 text-[10px]"
                    title="Reset conversation"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                {messages.map(msg => {
                  const isAi = msg.sender === 'ai';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed ${
                          isAi
                            ? 'bg-white border border-neutral-200 text-neutral-800 shadow-xs rounded-tl-xs'
                            : 'bg-emerald-600 text-white shadow-xs rounded-tr-xs font-medium'
                        }`}
                      >
                        {/* Markdown / Formatted text handling */}
                        <div className="whitespace-pre-line space-y-1">
                          {msg.text.split('\n\n').map((para, idx) => (
                            <p key={idx}>{para}</p>
                          ))}
                        </div>

                        {/* Inline Escalation Card inside AI replies */}
                        {isAi && (
                          <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-col gap-1.5">
                            <p className="text-[10px] text-neutral-500 font-semibold">
                              Want human verification? Talk to our live agent:
                            </p>
                            <a
                              href={buildWhatsAppUrl(
                                msg.suggestedWhatsAppText ||
                                  'Hello ShopLink Support Agent, I have a question regarding ShopLink Kenya.'
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition-colors w-fit"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Direct to WhatsApp Agent</span>
                              <ExternalLink className="w-3 h-3 text-emerald-600" />
                            </a>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-1 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {isAiLoading && (
                  <div className="flex items-center gap-2 text-xs text-neutral-500 bg-white border border-neutral-200 rounded-2xl px-3 py-2 w-fit shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                    <span>ShopLink AI is thinking...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested quick prompt chips */}
              <div className="px-3 py-2 bg-white border-t border-neutral-100 flex gap-1.5 overflow-x-auto text-[11px]">
                <button
                  onClick={() => {
                    setAiInput('How do I create and share my online shop?');
                  }}
                  className="whitespace-nowrap px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                >
                  Create store?
                </button>
                <button
                  onClick={() => {
                    setAiInput('How does M-Pesa STK push payment work?');
                  }}
                  className="whitespace-nowrap px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                >
                  M-Pesa payments?
                </button>
                <button
                  onClick={() => {
                    setAiInput('Can I speak with a human agent on WhatsApp?');
                  }}
                  className="whitespace-nowrap px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold"
                >
                  Talk to agent?
                </button>
              </div>

              {/* Chat Input Field */}
              <form
                onSubmit={handleSendAiMessage}
                className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  placeholder="Ask the AI a question..."
                  className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-neutral-50/50"
                />
                <button
                  type="submit"
                  disabled={!aiInput.trim() || isAiLoading}
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-colors"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Footer Assistance Badge */}
          <div className="bg-neutral-50 px-4 py-2.5 border-t border-neutral-200/80 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="flex items-center gap-1.5 text-neutral-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Kenyan Support Desk</span>
            </span>
            <a
              href={buildWhatsAppUrl('Hello ShopLink Support Team, I need live assistance.')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3 text-emerald-600" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
