import { useEffect, useRef, useState } from 'react';
import { Sparkles, Loader2, Send, ChevronDown, Wand2, Command } from 'lucide-react';

const MAGIC_PHRASES = [
  { icon: '✨', text: 'Refining the architecture...' },
  { icon: '🔮', text: 'Styling the pixels...' },
  { icon: '🧠', text: 'Optimizing accessibility...' },
  { icon: '⚡', text: 'Injecting Tailwind magic...' },
  { icon: '🚀', text: 'Finalizing the build...' },
];

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface FloatingAiBarProps {
  open: boolean;
  onToggle: () => void;
  messages: Message[];
  feedback: string;
  setFeedback: (v: string) => void;
  isGenerating: boolean;
  onSend: () => void;
}

export function FloatingAiBar({
  open, onToggle, messages, feedback, setFeedback,
  isGenerating, onSend
}: FloatingAiBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Cycle through magic phrases
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % MAGIC_PHRASES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [feedback]);

  // Focus on open
  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 200);
  }, [open]);

  const suggestions = [
    { label: 'Dark mode', icon: '🌙' },
    { label: 'Green accent', icon: '🟢' },
    { label: 'More compact', icon: '⊟' },
    { label: 'Glass effect', icon: '✨' },
  ];

  if (!open) {
    return (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={onToggle}
          className="group relative flex items-center gap-3 px-6 py-3.5 bg-slate-950 text-white rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center gap-3">
            <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-bold tracking-tight">Edit with AI</span>
            {isGenerating && <Loader2 className="w-4 h-4 animate-spin opacity-70" />}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="relative group">
        
        {/* Animated Glow Border */}
        <div className={`absolute -inset-[1px] rounded-[24px] transition-all duration-700 blur-[1px] ${
          isFocused || isGenerating ? 'opacity-100 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500' : 'opacity-0 bg-slate-200'
        }`} />

        {/* Main Interface */}
        <div className="relative bg-white/80 backdrop-blur-2xl rounded-[23px] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
          
          {/* Loading States */}
          {isGenerating && (
            <div className="px-6 pt-5 pb-2 animate-in fade-in slide-in-from-top-1">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-violet-50 rounded-xl border border-violet-100">
                <Loader2 className="w-3.5 h-3.5 text-violet-600 animate-spin" />
                <span className="text-[11px] font-bold text-violet-700 uppercase tracking-wider">
                  {MAGIC_PHRASES[phraseIndex].icon} {MAGIC_PHRASES[phraseIndex].text}
                </span>
              </div>
            </div>
          )}

          {/* Prompt Suggestions */}
          {!isGenerating && messages.length === 0 && (
            <div className="px-6 pt-5 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Quick:</span>
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setFeedback(`Apply ${s.label.toLowerCase()}`)}
                  className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/50 hover:bg-white hover:shadow-md border border-slate-200/50 rounded-lg text-xs font-semibold text-slate-600 transition-all active:scale-95"
                >
                  <span>{s.icon}</span> {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="px-6 py-4">
            <div className={`relative flex items-end gap-3 p-1.5 rounded-2xl transition-all ${
              isFocused ? 'bg-white shadow-inner border-slate-200' : 'bg-slate-100/50 border-transparent'
            } border`}>
              <textarea
                ref={textareaRef}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="How should I refine this component?"
                disabled={isGenerating}
                rows={1}
                className="flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none resize-none leading-relaxed min-h-[44px] max-h-[120px]"
              />
              
              <button
                onClick={onSend}
                disabled={!feedback.trim() || isGenerating}
                className={`p-2.5 rounded-xl transition-all ${
                  feedback.trim() && !isGenerating 
                  ? 'bg-slate-950 text-white shadow-lg hover:scale-105 active:scale-95' 
                  : 'bg-slate-200 text-slate-400'
                }`}
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              <div className="flex items-center gap-1">
                <Command size={10} /> <span className="mt-0.5">Enter to Send</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="flex items-center gap-1"><Sparkles size={10} className="text-violet-500" /> Sktch AI Engine</span>
            </div>
            
            <button
              onClick={onToggle}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors"
            >
              <ChevronDown size={14} />
              <span>Minimize</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}