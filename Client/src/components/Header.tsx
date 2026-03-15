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
  Globe,
  Lock,
  Tag,
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
  visibility?: 'public' | 'private';
  onVisibilityChange?: (v: 'public' | 'private') => void;
  tags?: string[];
  onTagsChange?: (tags: string[]) => void;
  suggestedTags?: string[];
}

interface HeaderProps {
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  sketchControls?: SketchHeaderControls;
}

export function Header({ sketchControls, selectedModel, onModelChange }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isSaveOptionsOpen, setIsSaveOptionsOpen] = useState(false);
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
      visibility = 'public',
      onVisibilityChange,
      tags = [],
      onTagsChange,
      suggestedTags = [],
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

          {/* Tabs - only visible when UI has been generated */}
          {generatedCode && (
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
              <TabButton
                active={activeTab === 'chat'}
                onClick={() => onTabChange('chat')}
                icon={<MessageSquare className="w-3.5 h-3.5" />}
                label="Refine"
              />
            </div>
          )}

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

          {/* Naming input */}
          <div className="w-full flex flex-row justify-end items-center gap-3">
            {generatedCode && (
              <div className="flex flex-row items-center gap-2 border rounded-lg border-indigo-500 pr-1">
                <input
                  type="text"
                  value={sketchTitle}
                  onChange={(e) => onSketchTitleChange(e.target.value)}
                  placeholder="Sketch name..."
                  className="w-28 sm:w-36 px-2.5 py-1.5 text-[15px] bg-white rounded-lg text-indigo-500 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all flex-shrink-0"
                />
                <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                  <Pencil className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
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
              <div className="relative flex items-center rounded-lg border border-indigo-200 bg-indigo-600 shadow-sm">
                <button
                  onClick={() => {
                    if (tags.length === 0) return;
                    onSave();
                    setIsSaveOptionsOpen(false);
                  }}
                  disabled={isSaving || tags.length === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 transition-colors"
                  title={!isAuthenticated ? 'Log in to save' : tags.length === 0 ? 'Add at least one tag to save' : 'Save to My Sketches'}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save</span>
                </button>
                {onVisibilityChange && onTagsChange && (
                  <>
                    <div className="w-px h-6 bg-indigo-500/50" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSaveOptionsOpen((prev) => !prev);
                      }}
                      className="flex items-center justify-center px-2.5 py-2 text-white hover:bg-indigo-500 transition-colors"
                      title="Save options"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSaveOptionsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isSaveOptionsOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[99]"
                          onClick={() => setIsSaveOptionsOpen(false)}
                          aria-hidden="true"
                        />
                        <div className="absolute top-full mt-2 right-0 w-72 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-300/50 z-[100]">
                          <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-slate-900">Save options</h3>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsSaveOptionsOpen(false);
                                  if (tags.length > 0) {
                                    onSave();
                                  }
                                }}
                                disabled={tags.length === 0 || isSaving}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Save now
                              </button>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-slate-700 block mb-2">Visibility</label>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => onVisibilityChange('private')}
                                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    visibility === 'private'
                                      ? 'bg-slate-100 text-slate-900 border-2 border-slate-300'
                                      : 'text-slate-600 hover:bg-slate-50 border-2 border-transparent'
                                  }`}
                                >
                                  <Lock className="w-4 h-4" />
                                  Private
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onVisibilityChange('public')}
                                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    visibility === 'public'
                                      ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-300'
                                      : 'text-slate-600 hover:bg-slate-50 border-2 border-transparent'
                                  }`}
                                >
                                  <Globe className="w-4 h-4" />
                                  Public
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-slate-700 flex items-center gap-1 mb-2">
                                <Tag className="w-3.5 h-3.5" />
                                Tags <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={tags.join(', ')}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  const parsed = v.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
                                  onTagsChange([...new Set(parsed)]);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') e.preventDefault();
                                }}
                                placeholder="Type or click suggested tags to add"
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder:text-slate-400"
                              />
                              {suggestedTags.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-slate-500 mb-1.5">Suggested</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {suggestedTags
                                      .filter((t) => !tags.includes(t))
                                      .map((t) => (
                                        <button
                                          key={t}
                                          type="button"
                                          onClick={() => onTagsChange([...tags, t])}
                                          className="px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                                        >
                                          + {t}
                                        </button>
                                      ))}
                                    {suggestedTags.filter((t) => !tags.includes(t)).length === 0 && suggestedTags.length > 0 && (
                                      <span className="text-xs text-slate-400">All suggested tags added</span>
                                    )}
                                  </div>
                                </div>
                              )}
                              {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {tags.map((t) => (
                                    <span
                                      key={t}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium"
                                    >
                                      {t}
                                      <button
                                        type="button"
                                        onClick={() => onTagsChange(tags.filter((x) => x !== t))}
                                        className="hover:text-red-500 hover:bg-slate-200 rounded p-0.5 transition-colors"
                                        aria-label={`Remove ${t}`}
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}
                              {tags.length === 0 && (
                                <p className="text-xs text-amber-600 mt-1.5">At least one tag is required to save</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
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

