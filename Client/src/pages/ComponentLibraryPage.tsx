import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { listComponentsWithCode, getComponent, type ComponentDetail } from '../services/componentApi';
import { generateUIStreaming } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { CATEGORIES } from './component-library/constants';
import type { TabType, Resolution, Message } from './component-library/constants';
import { ComponentLibraryHeader } from './component-library/ComponentLibraryHeader';
import { ComponentLibrarySidebar } from './component-library/ComponentLibrarySidebar';
import { ComponentLibraryLanding } from './component-library/ComponentLibraryLanding';
import { ComponentLibraryDetailView } from './component-library/ComponentLibraryDetailView';

export function ComponentLibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();

  // All components fetched with code in a single API call
  const [allComponents, setAllComponents] = useState<ComponentDetail[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selected, setSelected] = useState<ComponentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('preview');
  const [resolution, setResolution] = useState<Resolution>('desktop');

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const [messages, setMessages] = useState<Message[]>([]);
  const [feedback, setFeedback] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const firstDeltaRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Single API call — fetch all components WITH code
  useEffect(() => {
    setLoadingList(true);
    listComponentsWithCode()
      .then((res) => setAllComponents(res.data?.components ?? []))
      .catch(() => setAllComponents([]))
      .finally(() => setLoadingList(false));
  }, []);

  const loadComponent = useCallback((id: string) => {
    // Since we already have all components with code, find it locally first
    const existing = allComponents.find((c) => c.id === id);
    if (existing) {
      setSelected(existing);
      setCode(existing.code);
      setMessages([]);
      setActiveTab('preview');
      setBubbleOpen(false);
      setLoadingDetail(false);
      return;
    }

    // Fallback: fetch from API if not in local list (shouldn't normally happen)
    setLoadingDetail(true);
    setCode('');
    getComponent(id)
      .then((res) => {
        const c = res.data?.component;
        if (c) {
          setSelected(c);
          setCode(c.code);
          setMessages([]);
          setActiveTab('preview');
          setBubbleOpen(false);
        }
      })
      .catch(() => addToast('error', 'Failed to load component'))
      .finally(() => setLoadingDetail(false));
  }, [allComponents, addToast]);

  useEffect(() => {
    const idFromUrl = searchParams.get('component');
    if (!idFromUrl && selected) {
      setSelected(null);
      setCode('');
      return;
    }
    if (idFromUrl && allComponents.length > 0 && (!selected || selected.id !== idFromUrl)) {
      loadComponent(idFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allComponents, searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const selectComponent = useCallback((id: string) => {
    setSearchParams((p) => { p.set('component', id); return p; });
    loadComponent(id);
    setMobileSidebarOpen(false);
  }, [setSearchParams, loadComponent]);

  const goToLanding = useCallback(() => {
    setSelected(null);
    setCode('');
    setMessages([]);
    setBubbleOpen(false);
    setSearchParams((p) => {
      p.delete('component');
      return p;
    });
    setMobileSidebarOpen(false);
  }, [setSearchParams]);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleCopy = useCallback(() => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleExport = useCallback(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!code || !selected) return;
    const safeName = selected.title.replace(/[^a-z0-9-_]/gi, '_');
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${safeName}.tsx`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }, [code, selected, isAuthenticated, navigate]);

  const handleSend = useCallback(async () => {
    if (!feedback.trim() || !code || isGenerating) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    const userMsg: Message = { role: 'user', content: feedback.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setFeedback('');
    setIsGenerating(true);
    firstDeltaRef.current = false;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    let accumulated = '';
    try {
      await generateUIStreaming(
        { feedback: feedback.trim(), currentCode: code, model: 'gemini-2.5-flash' },
        {
          onDelta: (chunk) => {
            accumulated += chunk;
            setCode(accumulated);
            if (!firstDeltaRef.current) {
              firstDeltaRef.current = true;
              setActiveTab('code');
            }
          },
          onDone: (result) => {
            setCode(result.code ?? accumulated);
            setMessages((prev) => [...prev, {
              role: 'assistant',
              content: result.assistantReply?.trim() || 'Done! Check the preview.',
            }]);
            setIsGenerating(false);
          },
          onError: (err) => { addToast('error', err); setIsGenerating(false); },
        },
        abortRef.current.signal
      );
    } catch { setIsGenerating(false); }
  }, [feedback, code, isGenerating, isAuthenticated, navigate, addToast]);

  const categoryCount = CATEGORIES.filter((cat) => allComponents.some((c) => c.category === cat.value)).length;

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">

      <ComponentLibraryHeader
        selected={selected}
        onOpenMobileMenu={() => setMobileSidebarOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        resolution={resolution}
        onResolutionChange={setResolution}
        copied={copied}
        onCopy={handleCopy}
        onExport={handleExport}
        user={user}
        userMenuOpen={userMenuOpen}
        onUserMenuOpenChange={setUserMenuOpen}
      />

      <div className="flex-1 flex min-h-0">

        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileSidebarOpen(false)} aria-hidden />
        )}

        <ComponentLibrarySidebar
          mobileSidebarOpen={mobileSidebarOpen}
          onMobileSidebarOpenChange={setMobileSidebarOpen}
          sidebarExpanded={sidebarExpanded}
          onSidebarExpandedChange={setSidebarExpanded}
          collapsedCategories={collapsedCategories}
          onToggleCategory={toggleCategory}
          allComponents={allComponents}
          selectedId={selected?.id}
          onSelectComponent={selectComponent}
          isLandingActive={!selected}
          onGoToLanding={goToLanding}
        />

        <div className="flex-1 flex flex-col min-w-0 min-h-0">

          {!selected && !loadingDetail && (
            <ComponentLibraryLanding
              components={allComponents}
              loading={loadingList}
              totalCount={allComponents.length}
              categoryCount={categoryCount}
              onSelect={selectComponent}
            />
          )}

          {loadingDetail && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Loading component...</p>
            </div>
          )}

          {selected && !loadingDetail && (
            <ComponentLibraryDetailView
              selected={selected}
              code={code}
              activeTab={activeTab}
              resolution={resolution}
              copied={copied}
              onCopy={handleCopy}
              messages={messages}
              feedback={feedback}
              setFeedback={setFeedback}
              isGenerating={isGenerating}
              bubbleOpen={bubbleOpen}
              onBubbleToggle={() => setBubbleOpen((p) => !p)}
              onSend={handleSend}
              messagesEndRef={messagesEndRef}
            />
          )}
        </div>
      </div>
    </div>
  );
}