import { Link, useNavigate } from 'react-router-dom';
import {
  Copy, Check, Code2, Eye, ChevronRight, Menu, Download,
  Home, Layers, ChevronDown, FolderOpen, Globe,
} from 'lucide-react';
import { AvatarImage } from '../../components/AvatarImage';
import type { User } from '../../services/auth';
import type { ComponentDetail } from '../../services/componentApi';
import type { TabType, Resolution } from './constants';
import { RESOLUTIONS } from './constants';

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export interface ComponentLibraryHeaderProps {
  selected: ComponentDetail | null;
  onOpenMobileMenu: () => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  resolution: Resolution;
  onResolutionChange: (r: Resolution) => void;
  copied: boolean;
  onCopy: () => void;
  onExport: () => void;
  user: User | null;
  userMenuOpen: boolean;
  onUserMenuOpenChange: (open: boolean) => void;
}

export function ComponentLibraryHeader({
  selected,
  onOpenMobileMenu,
  activeTab,
  onTabChange,
  resolution,
  onResolutionChange,
  copied,
  onCopy,
  onExport,
  user,
  userMenuOpen,
  onUserMenuOpenChange,
}: ComponentLibraryHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 gap-3 flex-shrink-0 z-30 relative">
      <div className="flex items-center gap-3 min-w-0">
        <Link to="/home"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-all flex-shrink-0">
          <Home className="w-4 h-4 text-slate-500" />
        </Link>
        <div className="w-px h-5 bg-slate-200 flex-shrink-0" />
        <button type="button" onClick={onOpenMobileMenu} aria-label="Open component list"
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors">
          <Menu className="w-4 h-4 text-slate-600" />
        </button>
        <div className="hidden sm:flex items-center gap-1.5 min-w-0">
          <Layers className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span className="text-sm font-semibold text-slate-800 truncate">Component Library</span>
          {selected && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-500 truncate">{selected.title}</span>
            </>
          )}
        </div>
      </div>

      {selected && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {(['preview', 'code'] as TabType[]).map((tab) => (
              <button key={tab} type="button" onClick={() => onTabChange(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}>
                {tab === 'preview' ? <Eye className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline capitalize">{tab}</span>
              </button>
            ))}
          </div>
          {activeTab === 'preview' && (
            <div className="flex items-center gap-0.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              {RESOLUTIONS.map((r) => {
                const Icon = r.icon;
                return (
                  <button key={r.value} type="button" onClick={() => onResolutionChange(r.value)} title={r.label}
                    className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                      resolution === r.value ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
                    }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 flex-shrink-0">
        {selected && (
          <>
            <button type="button" onClick={onCopy}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl transition-all">
              {copied
                ? <><Check className="w-3.5 h-3.5 text-emerald-500" /><span className="hidden sm:inline text-emerald-600">Copied!</span></>
                : <><Copy className="w-3.5 h-3.5" /><span className="hidden sm:inline">Copy</span></>}
            </button>
            <button type="button" onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export .tsx</span>
            </button>
          </>
        )}
        <div className="w-px h-5 bg-slate-200" />
        {user ? (
          <div className="relative">
            <button type="button" onClick={() => onUserMenuOpenChange(!userMenuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-all">
              <AvatarImage src={user.avatar} alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
                fallback={
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold border border-slate-200">
                    {getInitials(user.name)}
                  </div>
                }
                getInitials={getInitials}
              />
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => onUserMenuOpenChange(false)} aria-hidden />
                <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-20">
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    {[
                      { label: 'Dashboard', icon: Home, path: '/home' },
                      { label: 'My Sketches', icon: FolderOpen, path: '/sketches' },
                      { label: 'Explore', icon: Globe, path: '/explore' },
                    ].map(({ label, icon: Icon, path }) => (
                      <button key={path} type="button" onClick={() => { onUserMenuOpenChange(false); navigate(path); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm transition-all">
                        <Icon className="w-4 h-4" />{label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <button type="button" onClick={() => navigate('/login')}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all">
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
