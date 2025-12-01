import { Eye, Code2, Send, Loader2, Maximize2, MessageSquare, User, Bot, Sparkles, Copy, Check } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { LivePreview } from './LivePreview';
import { generateFullPageHTML } from '../utils/previewHtml';

type TabType = 'preview' | 'code' | 'chat';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CodePreviewPanelProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  generatedCode: string;
  isGenerating: boolean;
  onIterate?: (feedback: string) => void;
}

export function CodePreviewPanel({
  activeTab,
  onTabChange,
  generatedCode,
  isGenerating,
  onIterate,
}: CodePreviewPanelProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isIterating, setIsIterating] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessageInternal();
    }
  };

  const prevGeneratingRef = useRef(isGenerating);

  const handleSendMessageInternal = useCallback(() => {
    if (!inputMessage.trim() || !onIterate || isGenerating) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMessage]);
    setIsIterating(true);

    onIterate(inputMessage.trim());
    setInputMessage('');
  }, [inputMessage, onIterate, isGenerating]);

  useEffect(() => {
    if (prevGeneratingRef.current && !isGenerating && isIterating && generatedCode) {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: 'Done! I\'ve applied your changes. Check the Preview tab.',
        timestamp: new Date(),
      };
      setTimeout(() => {
        setChatMessages(prev => [...prev, assistantMessage]);
        setIsIterating(false);
      }, 0);
    }
    prevGeneratingRef.current = isGenerating;
  }, [isGenerating, generatedCode, isIterating]);

  const handleOpenFullscreen = () => {
    if (!generatedCode) return;
    const fullHTML = generateFullPageHTML(generatedCode);
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-bl from-purple-500/2 via-transparent to-indigo-500/2 pointer-events-none z-0" />

      {/* Tab Header */}
      <div className="relative z-10 flex items-center justify-between px-3 py-2.5 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700/30">
          <TabButton
            active={activeTab === 'preview'}
            onClick={() => onTabChange('preview')}
            icon={<Eye className="w-3.5 h-3.5" />}
            label="Preview"
          />
          <TabButton
            active={activeTab === 'code'}
            onClick={() => onTabChange('code')}
            icon={<Code2 className="w-3.5 h-3.5" />}
            label="Code"
          />
          {generatedCode && (
            <TabButton
              active={activeTab === 'chat'}
              onClick={() => onTabChange('chat')}
              icon={<MessageSquare className="w-3.5 h-3.5" />}
              label="Refine"
            />
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {isGenerating && !isIterating && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <div className="relative w-3 h-3">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-400 animate-spin" />
              </div>
              <span className="text-xs font-medium text-indigo-300">
                Generating...
              </span>
            </div>
          )}
          {generatedCode && activeTab === 'preview' && (
            <button
              onClick={handleOpenFullscreen}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-600 rounded-lg transition-all"
              title="Open in new tab"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative z-10">
        {isGenerating && !isIterating ? (
          <GeneratingState />
        ) : activeTab === 'preview' ? (
          <PreviewView code={generatedCode} />
        ) : activeTab === 'code' ? (
          <CodeView code={generatedCode} />
        ) : (
          <ChatView
            messages={chatMessages}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            onSend={handleSendMessageInternal}
            onKeyDown={handleKeyDown}
            isGenerating={isGenerating}
            isIterating={isIterating}
          />
        )}
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${active
        ? 'bg-slate-700/80 text-white shadow-sm'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
        }`}
    >
      {icon}
      {label}
    </button>
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
          <div className="absolute inset-0 rounded-full border-2 border-slate-700/50" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-purple-500 animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />
          <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin [animation-duration:2s]" />
          <div className="absolute inset-6 rounded-full bg-slate-800/80 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          </div>
        </div>

        {/* Tip */}
        <div className="text-center">
          <p className="text-sm font-medium text-indigo-400 transition-all">
            {currentTip}
          </p>
          <div className="flex items-center justify-center gap-1 mt-3">
            {GENERATING_TIPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${i === currentTipIndex ? 'bg-indigo-500 w-4' : 'bg-slate-700 w-1'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="w-full p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
          <p className="text-sm text-slate-300 italic leading-relaxed">
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

function PreviewView({ code }: { code: string }) {
  if (!code) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
          <Eye className="w-7 h-7 text-slate-500" />
        </div>
        <h3 className="text-base font-medium text-slate-300 mb-1.5">
          No Preview Yet
        </h3>
        <p className="text-sm text-slate-500 max-w-[240px]">
          Draw a wireframe and click "Generate UI" to see the preview
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden bg-white rounded-tl-xl">
      <LivePreview code={code} />
    </div>
  );
}

interface ChatViewProps {
  messages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isGenerating: boolean;
  isIterating: boolean;
}

function ChatView({ messages, inputMessage, setInputMessage, onSend, onKeyDown, isGenerating, isIterating }: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isIterating]);

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="text-base font-medium text-slate-300 mb-1">
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
                  className="w-full text-left text-xs text-slate-400 bg-slate-800/40 hover:bg-slate-800/60 px-3 py-2 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-all"
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
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-indigo-400" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl ${message.role === 'user'
                    ? 'bg-indigo-500 text-white rounded-br-lg'
                    : 'bg-slate-800/80 text-slate-200 rounded-bl-lg border border-slate-700/30'
                    }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <span className="text-[10px] opacity-50 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {message.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-700/80 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
            {isIterating && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="max-w-[75%] px-3.5 py-2.5 rounded-2xl bg-slate-800/80 text-slate-200 rounded-bl-lg border border-slate-700/30">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    <p className="text-sm text-slate-300">Applying changes...</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/50">
        <div className="relative">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Describe what to change..."
            disabled={isGenerating}
            className="w-full px-4 py-2.5 pr-12 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all disabled:opacity-50"
          />
          <button
            onClick={onSend}
            disabled={!inputMessage.trim() || isGenerating}
            title="Send"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CodeView({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!code) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
          <Code2 className="w-7 h-7 text-slate-500" />
        </div>
        <h3 className="text-base font-medium text-slate-300 mb-1.5">
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
      <div className="bg-slate-800/60 rounded-xl border border-slate-700/40 overflow-hidden">
        {/* File header */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/40">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs font-medium text-slate-400 ml-2">
              GeneratedComponent.tsx
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-all"
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
        <pre className="p-4 overflow-auto code-editor text-slate-300 text-sm leading-relaxed">
          <code>
            {formatCodeWithHighlighting(code)}
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
      <div key={i} className="flex hover:bg-slate-700/20 -mx-4 px-4">
        <span className="w-10 text-slate-600 select-none text-right pr-4 text-xs">
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
      tokens.push({ text: keywordMatch[0], className: 'text-purple-400' });
      remaining = remaining.slice(keywordMatch[0].length);
      continue;
    }

    const stringMatch = remaining.match(/^(["'`])[^"'`]*\1/);
    if (stringMatch) {
      tokens.push({ text: stringMatch[0], className: 'text-emerald-400' });
      remaining = remaining.slice(stringMatch[0].length);
      continue;
    }

    const jsxTagMatch = remaining.match(/^<\/?([A-Z][A-Za-z]*)/);
    if (jsxTagMatch) {
      tokens.push({ text: '<', className: 'text-slate-500' });
      if (jsxTagMatch[0].startsWith('</')) {
        tokens.push({ text: '/', className: 'text-slate-500' });
      }
      tokens.push({ text: jsxTagMatch[1], className: 'text-cyan-400' });
      remaining = remaining.slice(jsxTagMatch[0].length);
      continue;
    }

    const htmlTagMatch = remaining.match(/^<\/?([a-z][a-z0-9]*)/);
    if (htmlTagMatch) {
      tokens.push({ text: '<', className: 'text-slate-500' });
      if (htmlTagMatch[0].startsWith('</')) {
        tokens.push({ text: '/', className: 'text-slate-500' });
      }
      tokens.push({ text: htmlTagMatch[1], className: 'text-pink-400' });
      remaining = remaining.slice(htmlTagMatch[0].length);
      continue;
    }

    const attrMatch = remaining.match(/^(className|onClick|onChange|style|href|src|alt|type|value|placeholder)=/);
    if (attrMatch) {
      tokens.push({ text: attrMatch[1], className: 'text-yellow-400' });
      tokens.push({ text: '=', className: 'text-slate-500' });
      remaining = remaining.slice(attrMatch[0].length);
      continue;
    }

    tokens.push({ text: remaining[0], className: 'text-slate-300' });
    remaining = remaining.slice(1);
  }

  return tokens;
}
