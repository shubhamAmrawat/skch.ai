import { ChevronDown, Download, Home, LogOut, User, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const models = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', color: 'bg-emerald-400' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', color: 'bg-blue-400' },
  { id: 'claude-3', name: 'Claude 3', provider: 'Anthropic', color: 'bg-amber-400' },
];

export function Header({ selectedModel, onModelChange }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const currentModel = models.find((m) => m.id === selectedModel) || models[0];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-14 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-4 relative z-50">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-indigo-500/2 via-transparent to-purple-500/2 pointer-events-none" />

      {/* Left: Logo & Navigation */}
      <div className="flex items-center gap-4 relative">
        {/* Home Button */}
        <Link
          to="/"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600 transition-all group"
          title="Back to Home"
        >
          <Home className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
        </Link>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-700/50" />

        {/* Logo */}
        <Logo size="sm" />
      </div>

      {/* Center: Model Selector */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800 transition-all group"
        >
          <div className={`w-2 h-2 rounded-full ${currentModel.color} animate-pulse`} />
          <span className="text-sm font-medium text-slate-200">
            {currentModel.name}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-60 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-20">
              <div className="p-1.5">
                <div className="px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  AI Model
                </div>
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onModelChange(model.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${selectedModel === model.id
                      ? 'bg-indigo-500/15 text-white'
                      : 'hover:bg-slate-700/50 text-slate-300'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${model.color} ${selectedModel === model.id ? '' : 'opacity-50'}`} />
                      <span className="text-sm font-medium">{model.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {model.provider}
                    </span>
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-700/50 px-4 py-3 bg-slate-900/50">
                <p className="text-xs text-slate-500">
                  Selected model will be used for UI generation
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 relative">
        <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/30 hover:bg-slate-800 transition-all group">
          <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          <span className="text-sm font-medium text-slate-300 group-hover:text-slate-200 hidden sm:block">
            Export
          </span>
        </button>

        {/* User Menu */}
        {user && (
          <div className="relative ml-2">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/50 transition-all"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-slate-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-slate-700">
                  {getInitials(user.name)}
                </div>
              )}
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 hidden sm:block ${isUserMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute top-full mt-2 right-0 w-56 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-20">
                  {/* User Info */}
                  <div className="p-4 border-b border-slate-700/50">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/sketches');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all"
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span className="text-sm">My Sketches</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">Profile</span>
                    </button>

                    <div className="my-1 h-px bg-slate-700/50" />

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

