import { useEffect, useRef, useState } from 'react';
import { Sparkles, Loader2, Bot, User, Send, ChevronDown } from 'lucide-react';
import type { Message } from './constants';

export interface ComponentLibraryFloatingAiBarProps {
  open: boolean;
  onToggle: () => void;
  messages: Message[];
  feedback: string;
  setFeedback: (v: string) => void;
  isGenerating: boolean;
  onSend: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ComponentLibraryFloatingAiBar({
  open, onToggle, messages, feedback, setFeedback,
  isGenerating, onSend, messagesEndRef,
}: ComponentLibraryFloatingAiBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [feedback]);

  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 150);
  }, [open]);

  const suggestions = [
    { label: 'Dark mode', icon: '🌙' },
    { label: 'Form validation', icon: '✓' },
    { label: 'More compact', icon: '⊟' },
    { label: 'Green accent', icon: '🟢' },
    { label: 'Loading states', icon: '⏳' },
  ];

  // ── Collapsed: floating CTA button ──
  if (!open) {
    return (
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <button type="button" onClick={onToggle}
          className="group relative flex items-center gap-2.5 pl-5 pr-6 py-3 text-sm font-semibold text-white rounded-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.35), 0 2px 8px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}>
          {/* Animated glow behind button */}
          <div className="absolute -inset-1 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.4))',
              filter: 'blur(12px)',
            }} />
          <Sparkles className="w-4 h-4" />
          <span>Edit with AI</span>
          {isGenerating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        </button>
      </div>
    );
  }

  // ── Expanded: floating overlay panel ──
  return (
    <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-auto">
      <div className="max-w-3xl mx-auto">
        {/* Outer glow container */}
        <div className="relative">
          {/* Animated gradient glow - visible on focus or generating */}
          <div
            className={`absolute -inset-[1.5px] rounded-[22px] transition-opacity duration-500 ${
              isFocused || isGenerating ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              background: isGenerating
                ? 'linear-gradient(135deg, #818cf8, #a78bfa, #c084fc, #a78bfa, #818cf8)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6, #6366f1)',
              backgroundSize: isGenerating ? '300% 300%' : '100% 100%',
              animation: isGenerating ? 'gradient-shift 2s ease infinite' : 'none',
            }}
          />

          {/* Soft outer shadow glow */}
          <div
            className={`absolute -inset-3 rounded-[28px] transition-opacity duration-700 ${
              isFocused || isGenerating ? 'opacity-60' : 'opacity-0'
            }`}
            style={{
              background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15), transparent 70%)',
              filter: 'blur(8px)',
            }}
          />

          {/* Main card */}
          <div className="relative rounded-[20px] overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              boxShadow: `
                0 24px 48px rgba(0, 0, 0, 0.08),
                0 8px 24px rgba(0, 0, 0, 0.04),
                0 0 0 1px rgba(148, 163, 184, 0.12),
                inset 0 1px 0 rgba(255, 255, 255, 0.6)
              `,
            }}>

            {/* ── Messages strip ── */}
            {messages.length > 0 && (
              <div className="px-5 pt-4 pb-2">
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                  {messages.slice(-4).map((msg, i) => (
                    <div key={i} className={`flex items-start gap-1.5 flex-shrink-0 max-w-[280px] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'assistant'
                          ? 'bg-gradient-to-br from-indigo-100 to-purple-100'
                          : 'bg-slate-100'
                      }`}>
                        {msg.role === 'assistant'
                          ? <Bot className="w-3 h-3 text-indigo-600" />
                          : <User className="w-3 h-3 text-slate-600" />
                        }
                      </div>
                      <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white'
                          : 'bg-slate-100/80 text-slate-700'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isGenerating && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl flex-shrink-0">
                      <div className="flex gap-0.5">
                        <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-indigo-600 font-medium">Applying changes</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}

            {/* ── Suggestion pills — gradient shimmer style ── */}
            {messages.length === 0 && (
              <div className="px-5 pt-4 pb-2">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex-shrink-0">Try</span>
                  {suggestions.map((s) => (
                    <button key={s.label} type="button"
                      onClick={() => setFeedback(s.label === 'Dark mode' ? 'Make it dark mode' : s.label === 'Form validation' ? 'Add form validation' : s.label === 'More compact' ? 'Make it more compact' : s.label === 'Green accent' ? 'Change accent to green' : 'Add loading states')}
                      className="group/pill flex-shrink-0 flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                      style={{
                        background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.9), rgba(241, 245, 249, 0.9))',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(148, 163, 184, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
                        color: '#475569',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(238, 242, 255, 0.95), rgba(245, 243, 255, 0.95))';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.1), 0 0 0 1px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)';
                        e.currentTarget.style.color = '#4338ca';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(248, 250, 252, 0.9), rgba(241, 245, 249, 0.9))';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(148, 163, 184, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)';
                        e.currentTarget.style.color = '#475569';
                      }}
                    >
                      <span className="text-[11px]">{s.icon}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Input area ── */}
            <div className="px-5 pt-2 pb-4">
              <div
                className={`relative flex items-center gap-2 rounded-2xl transition-all duration-300 ${
                  isGenerating ? 'opacity-60' : ''
                }`}
                style={{
                  background: '#f8fafc',
                  boxShadow: isFocused
                    ? '0 0 0 1.5px rgba(99, 102, 241, 0.25), 0 4px 12px rgba(99, 102, 241, 0.06), inset 0 2px 4px rgba(0,0,0,0.02)'
                    : '0 0 0 1px rgba(148, 163, 184, 0.2), inset 0 2px 4px rgba(0,0,0,0.02)',
                  padding: '12px 14px 12px 18px',
                }}
              >
                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Describe what you'd like to change..."
                  disabled={isGenerating}
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none leading-relaxed disabled:cursor-not-allowed"
                  style={{ minHeight: '24px', maxHeight: '120px' }}
                />

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Keyboard hint */}
                  {feedback.trim() && !isGenerating && (
                    <span className="text-[10px] text-slate-300 hidden sm:block select-none whitespace-nowrap mr-1">
                      ↵ send
                    </span>
                  )}

                  {/* Send button */}
                  <button type="button" onClick={onSend} disabled={!feedback.trim() || isGenerating}
                    className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
                      feedback.trim() && !isGenerating
                        ? 'hover:scale-105 active:scale-95'
                        : ''
                    }`}
                    style={{
                      background: feedback.trim() && !isGenerating
                        ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
                        : '#e2e8f0',
                      boxShadow: feedback.trim() && !isGenerating
                        ? '0 4px 12px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)'
                        : 'none',
                    }}>
                    {isGenerating ? (
                      <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                    ) : (
                      <Send className={`w-3.5 h-3.5 ${feedback.trim() ? 'text-white' : 'text-slate-400'}`} />
                    )}
                  </button>
                </div>
              </div>

              {/* Bottom row — minimize + model hint */}
              <div className="flex items-center justify-between mt-2.5 px-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-slate-400 font-medium">AI-powered edits</span>
                </div>
                <button type="button" onClick={onToggle}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 transition-colors font-medium"
                  title="Minimize">
                  <ChevronDown className="w-3 h-3" />
                  <span>Minimize</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe animation for gradient shift during generation */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}