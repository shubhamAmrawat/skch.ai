import { useState } from 'react';
import {
  ChevronDown,
  Home,
  LogOut,
  User,
  FolderOpen,
  Eye,
  Code2,
  MessageSquare,
  Loader2,
  Save,
  Download,
  Maximize2,
  Pencil,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AvatarImage } from './AvatarImage';
import { useAuth } from '../hooks/useAuth';

type TabType = 'preview' | 'code' | 'chat';

const MODEL_OPTIONS = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
] as const;

function getModelLabel(value: string): string {
  return MODEL_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export interface SketchHeaderControls {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  generatedCode: string;
  isGenerating: boolean;
  isIterating: boolean;
  sketchTitle: string;
  onSketchTitleChange: (title: string) => void;
  onSave: () => void;
  isAuthenticated: boolean;
  isSaving: boolean;
  onExport: () => void;
  onFullscreen: () => void;
  refineOnlyMode: boolean;
  onRefineOnlyModeChange: (enabled: boolean) => void;
}

interface HeaderProps {
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  sketchControls?: SketchHeaderControls;
}

export function Header({ sketchControls, selectedModel, onModelChange }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // SketchApp header: no logo, controls in header
  if (sketchControls) {
    const {
      activeTab,
      onTabChange,
      generatedCode,
      isGenerating,
      isIterating,
      sketchTitle,
      onSketchTitleChange,
      onSave,
      isAuthenticated,
      isSaving,
      onExport,
      onFullscreen,
      refineOnlyMode,
      onRefineOnlyModeChange,
    } = sketchControls;

    return (
      <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 gap-4 relative z-50 min-w-0">
        {/* Left: Home + Tabs + Naming */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            to="/home"
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-all group"
            title="Back to Home"
          >
            <Home className="w-4 h-4 text-slate-500 group-hover:text-slate-700 transition-colors" />
          </Link>

          <div className="w-px h-6 bg-slate-200 flex-shrink-0" />

          {/* Tabs - Refine tab hidden in refine-only mode (right pane is always chat) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 flex-shrink-0">
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
            {generatedCode && !refineOnlyMode && (
              <TabButton
                active={activeTab === 'chat'}
                onClick={() => onTabChange('chat')}
                icon={<MessageSquare className="w-3.5 h-3.5" />}
                label="Refine"
              />
            )}
          </div>

          {/* Model selector */}
          {selectedModel && onModelChange && (
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
                title="Select AI model"
              >
                <span className="truncate max-w-[100px]">{getModelLabel(selectedModel)}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isModelMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isModelMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsModelMenuOpen(false)}
                  />
                  <div className="absolute top-full mt-1.5 left-0 w-48 bg-white backdrop-blur-xl border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden z-20">
                    {MODEL_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          onModelChange(opt.value);
                          setIsModelMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-sm transition-all ${
                          selectedModel === opt.value
                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Refine-only mode switch + Naming input */}
          <div className="w-full flex flex-row justify-end items-center gap-3">
            {generatedCode && (
              <label className="flex items-center gap-2 cursor-pointer shrink-0" title="Refine only: hide canvas, focus on chat + preview">
                <span className="text-xs font-medium text-slate-600 whitespace-nowrap">Refine only</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={refineOnlyMode ? 'true' : 'false'}
                  onClick={() => onRefineOnlyModeChange(!refineOnlyMode)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    refineOnlyMode ? 'bg-indigo-500' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                      refineOnlyMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </label>
            )}
            <div className="flex flex-row items-center gap-2 border rounded-lg border-indigo-500 pr-1">
              {generatedCode && (
                <input
                  type="text"
                  value={sketchTitle}
                  onChange={(e) => onSketchTitleChange(e.target.value)}
                  placeholder="Sketch name..."
                  className="w-28 sm:w-36 px-2.5 py-1.5 text-[15px] bg-white rounded-lg text-indigo-500 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all flex-shrink-0"
                />
              )}
              <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                <Pencil className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right: Status + Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isGenerating && !isIterating && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg">
              <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              <span className="text-xs font-medium text-indigo-700">Generating...</span>
            </div>
          )}
          {generatedCode && (
            <>
              <button
                onClick={onSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
                title={isAuthenticated ? 'Save to My Sketches' : 'Log in to save'}
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Save</span>
              </button>
              <button
                onClick={onExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg transition-all"
                title="Download code as .tsx file"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
              {activeTab === 'preview' && (
                <button
                  onClick={onFullscreen}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg transition-all"
                  title="Open in new tab"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </button>
              )}
            </>
          )}

          <div className="w-px h-6 bg-slate-200" />

          {/* User Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-all"
              >
                <AvatarImage
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover object-center border-2 border-slate-200"
                  fallback={
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold border-2 border-slate-200">
                      {getInitials(user.name)}
                    </div>
                  }
                  getInitials={getInitials}
                />
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 hidden sm:block ${isUserMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute top-full mt-2 right-0 w-56 bg-white backdrop-blur-xl border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden z-20">
                    <div className="p-4 border-b border-slate-200">
                      <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/sketches');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-all"
                      >
                        <FolderOpen className="w-4 h-4" />
                        <span className="text-sm">My Sketches</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/profile');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-all"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">Profile</span>
                      </button>
                      <div className="my-1 h-px bg-slate-200" />
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>
    );
  }

  // Default header (for other pages - not used currently, but kept for consistency)
  return (
    <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 relative z-50">
      <div className="flex items-center gap-4 relative">
        <Link
          to="/"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-all group"
          title="Back to Home"
        >
          <Home className="w-4 h-4 text-slate-500 group-hover:text-slate-700 transition-colors" />
        </Link>
        <div className="w-px h-6 bg-slate-200" />
      </div>
      <div className="flex items-center gap-2 relative">
        {user && (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-all"
            >
              <AvatarImage
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover object-center border-2 border-slate-200"
                fallback={
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold border-2 border-slate-200">
                    {getInitials(user.name)}
                  </div>
                }
                getInitials={getInitials}
              />
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 hidden sm:block ${isUserMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute top-full mt-2 right-0 w-56 bg-white backdrop-blur-xl border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden z-20">
                  <div className="p-4 border-b border-slate-200">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/sketches');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-all"
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span className="text-sm">My Sketches</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-all"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">Profile</span>
                    </button>
                    <div className="my-1 h-px bg-slate-200" />
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active
          ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

