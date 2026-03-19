import { Eye, Code2, Send, Loader2, MessageSquare, User, Bot, Sparkles, Copy, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { LivePreview } from './LivePreview';
import { ResizableSplitPane } from './ResizableSplitPane';
import type { ConversationEntry } from '../pages/SketchApp';

type TabType = 'canvas' | 'preview' | 'code' | 'chat';

interface CodePreviewPanelProps {
  activeTab: TabType;
  generatedCode: string;
  isGenerating: boolean;
  conversationHistory: ConversationEntry[];
  onIterate?: (feedback: string) => void;
}

export function CodePreviewPanel({
  activeTab,
  generatedCode,
  isGenerating,
  conversationHistory,
  onIterate,
}: CodePreviewPanelProps) {
  const [inputMessage, setInputMessage] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessageInternal();
    }
  };

  const handleSendMessageInternal = () => {
    if (!inputMessage.trim() || !onIterate || isGenerating) return;
    onIterate(inputMessage.trim());
    setInputMessage('');
  };

  // Show "Applying changes..." when last message is user and we're generating
  const isIterating = isGenerating && conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1]?.role === 'user';

  // Show GeneratingState only when we have no code yet (waiting for first token). Once streaming starts, show code.
  const showGeneratingState = isGenerating && generatedCode.length < 30;

  // Refine tab: split layout - Preview on left, Chat on right
  if (activeTab === 'chat') {
    return (
      <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-bl from-slate-100/30 via-transparent to-slate-100/30 pointer-events-none z-0" />
        <ResizableSplitPane
          left={
            <div className="h-full overflow-hidden bg-white rounded-tl-xl border border-slate-200">
              {showGeneratingState ? (
                <GeneratingState />
              ) : (
                <PreviewView code={generatedCode} isStreaming={isGenerating} />
              )}
            </div>
          }
          right={
            <div className="h-full flex flex-col bg-slate-50">
              <ChatView
                messages={conversationHistory}
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                onSend={handleSendMessageInternal}
                onKeyDown={handleKeyDown}
                isGenerating={isGenerating}
                isIterating={isIterating}
              />
            </div>
          }
          defaultLeftWidth={55}
          minLeftWidth={35}
          maxLeftWidth={75}
        />
      </div>
    );
  }

  // Code tab: split layout - Preview on left, Code on right (for future editing)
  if (activeTab === 'code') {
    return (
      <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-bl from-slate-100/30 via-transparent to-slate-100/30 pointer-events-none z-0" />
        <ResizableSplitPane
          left={
            <div className="h-full overflow-hidden bg-white rounded-tl-xl border border-slate-200">
              {showGeneratingState ? (
                <GeneratingState />
              ) : (
                <PreviewView code={generatedCode} isStreaming={isGenerating} />
              )}
            </div>
          }
          right={
            <div className="h-full overflow-hidden bg-slate-50">
              <CodeView code={generatedCode} isStreaming={isGenerating} />
            </div>
          }
          defaultLeftWidth={55}
          minLeftWidth={35}
          maxLeftWidth={75}
        />
      </div>
    );
  }

  // Preview tab: single panel (full width)
  // Canvas tab: right panel is collapsed; render placeholder (not visible)
  return (
    <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-bl from-slate-100/30 via-transparent to-slate-100/30 pointer-events-none z-0" />
      <div className="flex-1 overflow-hidden relative z-10">
        {showGeneratingState ? (
          <GeneratingState />
        ) : activeTab === 'preview' ? (
          <PreviewView code={generatedCode} isStreaming={isGenerating} />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm" />
        )}
      </div>
    </div>
  );
}

const UI_QUOTES = [
  { quote: "Good design is obvious. Great design is transparent.", author: "Joe Sparano" },
  { quote: "Design is not just what it looks like. Design is how it works.", author: "Steve Jobs" },
  { quote: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { quote: "The details are not the details. They make the design.", author: "Charles Eames" },
  { quote: "White space is like air: it is necessary for design to breathe.", author: "Wojciech Zieliński" },
  { quote: "Design is thinking made visual.", author: "Saul Bass" },
];

const GENERATING_TIPS = [
  "Analyzing your wireframe...",
  "Identifying components...",
  "Matching styles...",
  "Crafting React code...",
  "Adding animations...",
  "Optimizing layout...",
  "Final touches...",
];

function GeneratingState() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % UI_QUOTES.length);
    }, 4000);
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % GENERATING_TIPS.length);
    }, 2000);
    return () => {
      clearInterval(quoteInterval);
      clearInterval(tipInterval);
    };
  }, []);

  const currentQuote = UI_QUOTES[currentQuoteIndex];
  const currentTip = GENERATING_TIPS[currentTipIndex];

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-6 max-w-sm">
        {/* Animated loader */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-slate-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-slate-500 animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />
          <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin [animation-duration:2s]" />
          <div className="absolute inset-6 rounded-full bg-white flex items-center justify-center border border-slate-200">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          </div>
        </div>

        {/* Tip */}
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700 transition-all">
            {currentTip}
          </p>
          <div className="flex items-center justify-center gap-1 mt-3">
            {GENERATING_TIPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${i === currentTipIndex ? 'bg-indigo-500 w-4' : 'bg-slate-200 w-1'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="w-full p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-600 italic leading-relaxed">
            "{currentQuote.quote}"
          </p>
          <p className="text-xs text-slate-500 mt-2">
            — {currentQuote.author}
          </p>
        </div>
      </div>
    </div>
  );
}

function PreviewView({ code, isStreaming = false }: { code: string; isStreaming?: boolean }) {
  if (!code) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
          <Eye className="w-7 h-7 text-slate-400" />
        </div>
        <h3 className="text-base font-medium text-slate-700 mb-1.5">
          No Preview Yet
        </h3>
        <p className="text-sm text-slate-500 max-w-[240px]">
          Draw a wireframe and click "Generate UI" to see the preview
        </p>
      </div>
    );
  }

  // During streaming, don't attempt to render incomplete code - show placeholder
  if (isStreaming) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-tl-xl border border-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
        </div>
        <h3 className="text-base font-medium text-slate-700 mb-1.5">
          Generating preview...
        </h3>
        <p className="text-sm text-slate-500 max-w-[260px]">
          Code is streaming. Switch to the Code tab to see it live, or wait for completion to see the preview here.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden bg-white rounded-tl-xl border border-slate-200">
      <LivePreview code={code} />
    </div>
  );
}

interface ChatViewProps {
  messages: ConversationEntry[];
  inputMessage: string;
  setInputMessage: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isGenerating: boolean;
  isIterating: boolean;
}

function ChatView({ messages, inputMessage, setInputMessage, onSend, onKeyDown, isGenerating, isIterating }: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 100) + 'px';
  }, [inputMessage]);

  // Updated handleKeyDown to work with textarea
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
      return;
    }
    onKeyDown(e as unknown as React.KeyboardEvent);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isIterating]);

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="text-base font-medium text-slate-700 mb-1">
              Refine Your UI
            </h3>
            <p className="text-sm text-slate-500 max-w-[220px] mb-4">
              Describe changes you'd like to make
            </p>
            <div className="space-y-2 w-full max-w-[260px]">
              {[
                "Make the header darker",
                "Add a search bar",
                "Change button color to green",
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInputMessage(suggestion)}
                  className="w-full text-left text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-all"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-indigo-600" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl ${message.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-lg'
                    : 'bg-white text-slate-700 rounded-bl-lg border border-slate-200'
                    }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <span className="text-[10px] opacity-50 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {message.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                )}
              </div>
            ))}
            {isIterating && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="max-w-[75%] px-3.5 py-2.5 rounded-2xl bg-white text-slate-700 rounded-bl-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                    <p className="text-sm text-slate-600">Applying changes...</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {/* Floating input — sits at bottom with padding, no border-top */}
      <div className="px-3 pb-3 pt-2">
        {/* Glow wrapper */}
        <div className={`
          relative rounded-2xl transition-all duration-300
          ${isGenerating
              ? 'shadow-[0_0_0_1px_rgba(148,163,184,0.3)]'
              : 'shadow-[0_0_0_1px_rgba(148,163,184,0.25),0_4px_16px_rgba(0,0,0,0.06)] focus-within:shadow-[0_0_0_1.5px_rgba(99,102,241,0.4),0_0_20px_rgba(99,102,241,0.12),0_4px_16px_rgba(0,0,0,0.08)]'
          }
        `}>
          {/* Gradient border effect */}
          <div className={`
            absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none
            focus-within:opacity-100
            bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-indigo-500/20
          `} />
          
          {/* Inner container */}
          <div className={`
            relative flex flex-col bg-white rounded-2xl overflow-hidden
            ${isGenerating ? 'opacity-60' : ''}
          `}>
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Describe what to change..."
              disabled={isGenerating}
              rows={1}
              className="w-full px-4 pt-2.5 pb-0 bg-transparent resize-none text-sm text-slate-900 placeholder-slate-400 focus:outline-none disabled:cursor-not-allowed leading-relaxed"
              style={{ minHeight: '42px', maxHeight: '70px' }}
            />

            <div className="flex items-center justify-end px-2.5 pb-1.5">
              {inputMessage.trim() && !isGenerating && (
                <span className="text-[10px] text-slate-300 hidden sm:block select-none mr-2">
                  ⇧↵ newline
                </span>
              )}
              <button
                onClick={onSend}
                disabled={!inputMessage.trim() || isGenerating}
                title="Send"
                className={`
                  p-1.5 rounded-xl transition-all duration-150
                  ${inputMessage.trim() && !isGenerating
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-500/20'
                    : 'bg-slate-100 cursor-not-allowed'
                  }
                `}
              >
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                ) : (
                  <Send className={`w-3.5 h-3.5 ${inputMessage.trim() ? 'text-white' : 'text-slate-300'}`} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeView({ code, isStreaming = false }: { code: string; isStreaming?: boolean }) {
  const [copied, setCopied] = useState(false);
  const codeEndRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-scroll to bottom when code is streaming (instant to keep up with rapid updates)
  useEffect(() => {
    if (isStreaming && code) {
      codeEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
  }, [code, isStreaming]);

  if (!code) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
          <Code2 className="w-7 h-7 text-slate-400" />
        </div>
        <h3 className="text-base font-medium text-slate-700 mb-1.5">
          No Code Yet
        </h3>
        <p className="text-sm text-slate-500 max-w-[240px]">
          Generate UI from your wireframe to see the code
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-3">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {/* File header */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs font-medium text-slate-600 ml-2">
              GeneratedComponent.tsx
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code */}
        <pre className="p-4 overflow-auto code-editor text-slate-700 text-sm leading-relaxed bg-slate-50/50">
          <code>
            {formatCodeWithHighlighting(code)}
            <div ref={codeEndRef} className="h-px" aria-hidden="true" />
          </code>
        </pre>
      </div>
    </div>
  );
}

function formatCodeWithHighlighting(code: string) {
  const lines = code.split('\n');

  return lines.map((line, i) => {
    const tokens = tokenizeLine(line);

    return (
      <div key={i} className="flex hover:bg-slate-100 -mx-4 px-4">
        <span className="w-10 text-slate-400 select-none text-right pr-4 text-xs">
          {i + 1}
        </span>
        <span className="flex-1">
          {tokens.map((token, j) => (
            <span key={j} className={token.className}>
              {token.text}
            </span>
          ))}
        </span>
      </div>
    );
  });
}

interface Token {
  text: string;
  className: string;
}

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let remaining = line;

  while (remaining.length > 0) {
    const keywordMatch = remaining.match(/^(import|export|from|const|function|return|default)\b/);
    if (keywordMatch) {
      tokens.push({ text: keywordMatch[0], className: 'text-indigo-600' });
      remaining = remaining.slice(keywordMatch[0].length);
      continue;
    }

    const stringMatch = remaining.match(/^(["'`])[^"'`]*\1/);
    if (stringMatch) {
      tokens.push({ text: stringMatch[0], className: 'text-emerald-600' });
      remaining = remaining.slice(stringMatch[0].length);
      continue;
    }

    const jsxTagMatch = remaining.match(/^<\/?([A-Z][A-Za-z]*)/);
    if (jsxTagMatch) {
      tokens.push({ text: '<', className: 'text-slate-500' });
      if (jsxTagMatch[0].startsWith('</')) {
        tokens.push({ text: '/', className: 'text-slate-500' });
      }
      tokens.push({ text: jsxTagMatch[1], className: 'text-cyan-600' });
      remaining = remaining.slice(jsxTagMatch[0].length);
      continue;
    }

    const htmlTagMatch = remaining.match(/^<\/?([a-z][a-z0-9]*)/);
    if (htmlTagMatch) {
      tokens.push({ text: '<', className: 'text-slate-500' });
      if (htmlTagMatch[0].startsWith('</')) {
        tokens.push({ text: '/', className: 'text-slate-500' });
      }
      tokens.push({ text: htmlTagMatch[1], className: 'text-pink-600' });
      remaining = remaining.slice(htmlTagMatch[0].length);
      continue;
    }

    const attrMatch = remaining.match(/^(className|onClick|onChange|style|href|src|alt|type|value|placeholder)=/);
    if (attrMatch) {
      tokens.push({ text: attrMatch[1], className: 'text-amber-600' });
      tokens.push({ text: '=', className: 'text-slate-500' });
      remaining = remaining.slice(attrMatch[0].length);
      continue;
    }

    tokens.push({ text: remaining[0], className: 'text-slate-700' });
    remaining = remaining.slice(1);
  }

  return tokens;
}
