import type { RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import { LivePreview } from '../../components/LivePreview';
import { ResizableSplitPane } from '../../components/ResizableSplitPane';
import type { ComponentDetail } from '../../services/componentApi';
import { useAuth } from '../../hooks/useAuth';
import { formatCodeWithHighlighting } from './syntaxHighlight';
import { ComponentLibraryFloatingAiBar } from './ComponentLibraryFloatingAiBar';
import type { TabType, Resolution, Message } from './constants';
import { RESOLUTIONS } from './constants';

export interface ComponentLibraryDetailViewProps {
  selected: ComponentDetail;
  code: string;
  activeTab: TabType;
  resolution: Resolution;
  copied: boolean;
  onCopy: () => void;
  messages: Message[];
  feedback: string;
  setFeedback: (v: string) => void;
  isGenerating: boolean;
  bubbleOpen: boolean;
  onBubbleToggle: () => void;
  onSend: () => void;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export function ComponentLibraryDetailView({
  selected,
  code,
  activeTab,
  resolution,
  copied,
  onCopy,
  messages,
  feedback,
  setFeedback,
  isGenerating,
  bubbleOpen,
  onBubbleToggle,
  onSend,
  messagesEndRef,
}: ComponentLibraryDetailViewProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const currentResolution = RESOLUTIONS.find((r) => r.value === resolution)!;

  return (
    <div className="flex-1 min-h-0 relative">

      {activeTab === 'preview' ? (
        <div className="h-full overflow-auto dotted-grid">
          <div className="min-h-full flex items-start justify-center p-6">
            <div
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300"
              style={{ width: currentResolution.width, height: '82vh' }}>
              <LivePreview code={code} />
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full">
          <ResizableSplitPane
            left={
              <div className="h-full overflow-auto dotted-grid">
                <div className="min-h-full flex items-start justify-center p-4">
                  <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                    style={{ height: '82vh' }}>
                    <LivePreview code={code} />
                  </div>
                </div>
              </div>
            }
            right={
              <div className="h-full flex flex-col bg-white border-l border-slate-200">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                    </div>
                    <span className="text-xs font-medium text-slate-600 ml-2">{selected.title}.tsx</span>
                  </div>
                  <button type="button" onClick={onCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                    {copied
                      ? <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
                      : <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>}
                  </button>
                </div>
                <pre className="flex-1 overflow-auto p-4 code-editor text-sm leading-relaxed bg-slate-50/50">
                  <code>
                    {formatCodeWithHighlighting(code)}
                  </code>
                </pre>
              </div>
            }
            defaultLeftWidth={50}
            minLeftWidth={30}
            maxLeftWidth={70}
          />
        </div>
      )}

      <ComponentLibraryFloatingAiBar
        open={bubbleOpen}
        onToggle={() => {
          if (!isAuthenticated) { navigate('/login'); return; }
          onBubbleToggle();
        }}
        messages={messages}
        feedback={feedback}
        setFeedback={setFeedback}
        isGenerating={isGenerating}
        onSend={onSend}
        messagesEndRef={messagesEndRef}
      />
    </div>
  );
}
