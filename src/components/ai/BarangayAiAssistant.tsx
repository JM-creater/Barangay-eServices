import React, { useState, useEffect, useRef } from 'react';
import { aiService, ChatMessage } from '../../services/aiService';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface AiTriggerContext {
  page?: string;
  serviceCode?: string;
  referenceNumber?: string;
}

export const triggerBarangayAi = (prompt?: string, context?: AiTriggerContext) => {
  window.dispatchEvent(new CustomEvent('open-barangay-ai', { detail: { prompt, context } }));
};

export const BarangayAiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Maayong adlaw! I am your **Barangay Cansojong AI Assistant**, powered by our in-house trained Microsoft ONNX NLP model. I can assist you with real-time requirements, official fees, office schedules, appointment bookings, and live application tracking.\n\nWhat can I assist you with today?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentContext, setCurrentContext] = useState<AiTriggerContext | null>(null);
  const [contextBadge, setContextBadge] = useState<string>('Citizen Guidance');
  const [lastActionLink, setLastActionLink] = useState<string | null>(null);
  const [lastIntent, setLastIntent] = useState<{ intent?: string; confidence?: number } | null>(null);
  const [quickPrompts, setQuickPrompts] = useState<string[]>([
    'What are the requirements for Barangay Clearance?',
    'How much does a Barangay Business Permit cost?',
    'How to apply for a Certificate of Indigency?',
    'What are the Barangay Hall office hours?',
  ]);
  const [relatedServices, setRelatedServices] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string; context?: AiTriggerContext }>;
      setIsOpen(true);
      const ctx = customEvent.detail?.context || null;
      if (ctx) {
        setCurrentContext(ctx);
        loadContextualPrompts(ctx);
      }
      if (customEvent.detail?.prompt) {
        handleSendMessage(customEvent.detail.prompt, ctx);
      }
    };
    window.addEventListener('open-barangay-ai', handleOpen);
    return () => window.removeEventListener('open-barangay-ai', handleOpen);
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, loading, quickPrompts]);

  useEffect(() => {
    if (isOpen && !currentContext) {
      loadContextualPrompts();
    }
  }, [isOpen]);

  const loadContextualPrompts = (ctx?: AiTriggerContext | null) => {
    aiService
      .getContextualPrompts({
        page: ctx?.page,
        serviceCode: ctx?.serviceCode,
        referenceNumber: ctx?.referenceNumber,
      })
      .then((res) => {
        if (res) {
          if (res.contextBadge) setContextBadge(res.contextBadge);
          if (res.suggestedPrompts && res.suggestedPrompts.length > 0) {
            setQuickPrompts(res.suggestedPrompts);
          }
          if (res.actionLink) {
            setLastActionLink(res.actionLink);
          }
        }
      })
      .catch(() => {});
  };

  const handleSendMessage = async (textToSend?: string, ctxOverride?: AiTriggerContext | null) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInputValue('');
    setLoading(true);

    const activeCtx = ctxOverride !== undefined ? ctxOverride : currentContext;
    const contextString = activeCtx
      ? activeCtx.referenceNumber || activeCtx.serviceCode || activeCtx.page || ''
      : undefined;

    try {
      const response = await aiService.chatWithAiAssistant({
        message: text,
        conversationHistory: newMessages,
        context: contextString,
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.reply },
      ]);

      if (response.suggestedPrompts && response.suggestedPrompts.length > 0) {
        setQuickPrompts(response.suggestedPrompts);
      }
      if (response.relatedServices && response.relatedServices.length > 0) {
        setRelatedServices(response.relatedServices);
      }
      if (response.actionLink) {
        setLastActionLink(response.actionLink);
      }
      if (response.detectedIntent) {
        setLastIntent({
          intent: response.detectedIntent,
          confidence: response.confidenceScore,
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I apologize, I encountered a temporary connection issue. You can visit the **Services Catalog** directly or reach the Barangay Hall at (032) 272-0000.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          "Conversation restarted. Feel free to ask about any Barangay Cansojong document or service!",
      },
    ]);
    setRelatedServices([]);
    setLastActionLink(null);
    setLastIntent(null);
    setCurrentContext(null);
    loadContextualPrompts(null);
  };

  const formatIntentLabel = (intent: string) => {
    switch (intent) {
      case 'TRACK_STATUS':
        return 'Application Diagnostics';
      case 'REQ_CLEARANCE':
        return 'Barangay Clearance';
      case 'REQ_INDIGENCY':
        return 'Certificate of Indigency';
      case 'REQ_RESIDENCY':
        return 'Certificate of Residency';
      case 'REQ_BUSINESS':
        return 'Business Permit Clearance';
      case 'REQ_GOODMORAL':
        return 'Good Moral Character';
      case 'FEE_INQUIRY':
        return 'Official Fee Schedule';
      case 'PAYMENT_METHODS':
        return 'Payment Options';
      case 'HOURS_SCHEDULE':
        return 'Office Operating Hours';
      case 'CORRECTION_HELP':
        return 'Document Rectification';
      case 'APPOINTMENT_SLOT':
        return 'Appointment Booking';
      case 'FAST_TRACK':
        return 'Fast Track Criteria';
      case 'DISPUTE_LUPON':
        return 'Lupong Tagapamayapa';
      case 'DISCOUNT_SENIOR':
        return 'Senior & PWD Exemption';
      case 'CLAIM_REQUIREMENTS':
        return 'Claiming Requirements';
      default:
        return 'In-House Trained NLP';
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ai-assistant-fab"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1002,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 20px',
          background: isOpen
            ? 'linear-gradient(135deg, #0F2A4A 0%, #1E4E8C 100%)'
            : 'linear-gradient(135deg, #1E4E8C 0%, #0F2A4A 100%)',
          color: '#FFFFFF',
          border: '1.5px solid rgba(242, 182, 0, 0.45)',
          borderRadius: '9999px',
          boxShadow: '0 8px 24px -4px rgba(15, 42, 74, 0.35), 0 4px 8px -2px rgba(15, 42, 74, 0.2)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.9rem',
          fontFamily: 'inherit',
          transition: 'all 0.2s ease',
        }}
        aria-label={isOpen ? 'Close Barangay AI Assistant' : 'Open Barangay AI Assistant'}
      >
        {isOpen ? (
          <>
            <X size={18} color="#F2B600" />
            <span style={{ letterSpacing: '0.01em' }}>Close AI Assistant</span>
          </>
        ) : (
          <>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Bot size={20} color="#F2B600" />
              <span
                className="ai-pulse-dot"
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                }}
              />
            </div>
            <span style={{ letterSpacing: '0.01em' }}>Ask Barangay AI</span>
            <Sparkles size={16} color="#F2B600" style={{ opacity: 0.9 }} />
          </>
        )}
      </button>

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div
          className="ai-assistant-window"
          style={{
            position: 'fixed',
            bottom: '86px',
            right: '16px',
            zIndex: 1001,
            width: 'min(420px, calc(100vw - 24px))',
            maxWidth: 'calc(100vw - 24px)',
            height: '610px',
            maxHeight: 'calc(100vh - 100px)',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #DDE3EA',
            boxShadow: '0 20px 48px -8px rgba(15, 42, 74, 0.28), 0 8px 20px -4px rgba(15, 42, 74, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            className="ai-assistant-header"
            style={{
              padding: '13px 16px',
              background: 'linear-gradient(135deg, #1E4E8C 0%, #0F2A4A 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0, flex: 1 }}>
              {/* Bot Avatar with Active Online Status Indicator */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    border: '1.5px solid rgba(242, 182, 0, 0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F2B600',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
                  }}
                >
                  <Bot size={22} />
                </div>
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-1px',
                    right: '-1px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    border: '2px solid #0F2A4A',
                    boxShadow: '0 0 4px rgba(16, 185, 129, 0.6)',
                  }}
                  title="AI Inference Engine Online"
                />
              </div>

              {/* Title & Metadata Hierarchy */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '0.94rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    lineHeight: 1.25,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Barangay Cansojong AI
                </h3>

                <div
                  style={{
                    margin: '3px 0 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    color: '#BFDBFE',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(16, 185, 129, 0.22)',
                      color: '#6EE7B7',
                      border: '1px solid rgba(16, 185, 129, 0.45)',
                      letterSpacing: '0.02em',
                      flexShrink: 0,
                    }}
                  >
                    ✦ In-House ONNX
                  </span>
                  <span style={{ opacity: 0.5 }}>•</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentContext?.page ? `${contextBadge}` : 'Talisay City, Cebu'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <button
                onClick={handleReset}
                title="Restart Conversation"
                className="ai-header-btn"
              >
                <RotateCcw size={16} />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                className="ai-header-btn"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div
            className="ai-assistant-body"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {msg.role === 'assistant' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#EFF5FC',
                      color: '#1E4E8C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                      border: '1px solid #BCD5F0',
                    }}
                  >
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className={msg.role === 'user' ? 'ai-bubble-user' : 'ai-bubble-assistant'}
                  style={
                    msg.role === 'user'
                      ? {
                          background: 'linear-gradient(135deg, #1E4E8C 0%, #163d70 100%)',
                          color: '#FFFFFF',
                          borderRadius: '16px 16px 4px 16px',
                          padding: '11px 15px',
                          fontSize: '0.88rem',
                          lineHeight: '1.5',
                          maxWidth: '84%',
                          boxShadow: '0 3px 8px rgba(30, 78, 140, 0.2)',
                        }
                      : {
                          backgroundColor: '#FFFFFF',
                          color: '#1F2933',
                          border: '1px solid #E2E8F0',
                          borderRadius: '16px 16px 16px 4px',
                          padding: '12px 15px',
                          fontSize: '0.88rem',
                          lineHeight: '1.55',
                          maxWidth: '88%',
                          boxShadow: '0 2px 6px rgba(15, 42, 74, 0.04)',
                        }
                  }
                >
                  <div
                    style={{ whiteSpace: 'pre-wrap' }}
                    dangerouslySetInnerHTML={{
                      __html: formatMarkdownToHtml(msg.content),
                    }}
                  />
                </div>

                {msg.role === 'user' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#1E4E8C',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <User size={15} />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#EFF5FC',
                    color: '#1E4E8C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid #BCD5F0',
                  }}
                >
                  <Bot size={16} />
                </div>
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px 16px 16px 4px',
                    padding: '12px 16px',
                    boxShadow: '0 2px 6px rgba(15, 42, 74, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span className="ai-bouncing-dot" style={{ animationDelay: '0s' }} />
                  <span className="ai-bouncing-dot" style={{ animationDelay: '0.2s' }} />
                  <span className="ai-bouncing-dot" style={{ animationDelay: '0.4s' }} />
                  <span style={{ fontSize: '0.78rem', color: '#64748B', marginLeft: '6px', fontWeight: 500 }}>
                    Consulting in-house trained ONNX model...
                  </span>
                </div>
              </div>
            )}

            {/* Direct Action Link (if returned) */}
            {lastActionLink && !loading && (
              <div style={{ alignSelf: 'flex-start', marginLeft: '38px', marginTop: '-4px' }}>
                <Link
                  to={lastActionLink}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#1E4E8C',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 2px 6px rgba(30, 78, 140, 0.25)',
                  }}
                >
                  <span>Open Page & Take Action</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            )}

            {/* Related Service Links */}
            {relatedServices.length > 0 && !loading && (
              <div
                className="ai-assistant-suggestions"
                style={{
                  padding: '12px',
                  backgroundColor: '#EFF5FC',
                  borderRadius: '12px',
                  border: '1px solid #BCD5F0',
                  marginTop: '4px',
                }}
              >
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E4E8C', display: 'block', marginBottom: '8px' }}>
                  Direct Service Links:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {relatedServices.map((srv, i) => (
                    <Link
                      key={i}
                      to="/services"
                      onClick={() => setIsOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        backgroundColor: '#FFFFFF',
                        color: '#1E4E8C',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #DDE3EA',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1E4E8C';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.color = '#1E4E8C';
                      }}
                    >
                      <span>{srv}</span>
                      <ChevronRight size={14} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* In-Conversation Suggested Inquiries */}
            {!loading && quickPrompts.length > 0 && messages[messages.length - 1]?.role === 'assistant' && (
              <div className="ai-assistant-suggestions">
                <div className="ai-suggestions-header">
                  <Sparkles size={12} color="#F2B600" />
                  <span>Suggested Inquiries</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {quickPrompts.slice(0, 4).map((prompt, i) => (
                    <button
                      key={i}
                      disabled={loading}
                      onClick={() => handleSendMessage(prompt)}
                      className="ai-suggestion-card"
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#3B82F6',
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{prompt}</span>
                      </span>
                      <ChevronRight size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about clearances, fees, requirements..."
                disabled={loading}
                style={{
                  flex: 1,
                  fontSize: '0.88rem',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  outline: 'none',
                  backgroundColor: loading ? '#F8FAFC' : '#FFFFFF',
                  color: '#1F2933',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1E4E8C';
                  e.target.style.boxShadow = '0 0 0 3px rgba(30, 78, 140, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#CBD5E1';
                  e.target.style.boxShadow = 'none';
                }}
              />

              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                aria-label="Send Message"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: !inputValue.trim() || loading ? '#94A3B8' : '#1E4E8C',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: !inputValue.trim() || loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (inputValue.trim() && !loading) {
                    e.currentTarget.style.backgroundColor = '#163D70';
                  }
                }}
                onMouseLeave={(e) => {
                  if (inputValue.trim() && !loading) {
                    e.currentTarget.style.backgroundColor = '#1E4E8C';
                  }
                }}
              >
                <Send size={16} />
              </button>
            </form>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '8px',
                padding: '0 2px',
                fontSize: '11px',
                color: '#94A3B8',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} color="#10B981" />
                {lastIntent ? (
                  <span>
                    Intent: <strong>{formatIntentLabel(lastIntent.intent || '')}</strong> (
                    {Math.round((lastIntent.confidence || 0) * 100)}%)
                  </span>
                ) : (
                  <span>In-House Trained ONNX NLP</span>
                )}
              </span>
              <span>Barangay Cansojong</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Safe markdown formatter for clear readability
function formatMarkdownToHtml(markdown: string): string {
  let html = markdown
    .replace(/^### (.*$)/gim, '<h4 style="margin: 6px 0 4px 0; font-size: 0.95rem; font-weight: 700; color: #0F2A4A;">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 style="margin: 8px 0 6px 0; font-size: 1.05rem; font-weight: 800; color: #1E4E8C;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700; color: #0F2A4A;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="color: #475569;">$1</em>')
    .replace(/^- (.*$)/gim, '<div style="display: flex; align-items: flex-start; gap: 6px; margin: 3px 0;"><span style="color: #1E4E8C; font-weight: 800;">•</span><span>$1</span></div>')
    .replace(/^• (.*$)/gim, '<div style="display: flex; align-items: flex-start; gap: 6px; margin: 3px 0;"><span style="color: #1E4E8C; font-weight: 800;">•</span><span>$1</span></div>');

  return html;
}
export default BarangayAiAssistant;
