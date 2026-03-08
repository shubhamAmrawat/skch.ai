import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderOpen, LogIn, Menu, X, LogOut, ChevronDown, Sparkles, User, Globe } from 'lucide-react';
import { Logo } from './Logo';
import { AvatarImage } from './AvatarImage';
import { useAuth } from '../hooks/useAuth';
import { LoadingTransition } from './LoadingTransition';

export function LandingHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleStartSketching = () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/app');
    }, 1500);
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

  // Show loading transition
  if (isNavigating) {
    return <LoadingTransition />;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="group">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated && user ? (
              <>
                {/* My Sketches - only when logged in */}
                <button
                  onClick={() => navigate('/sketches')}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors group cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
                  <span>My Sketches</span>
                </button>
                <Link
                  to="/explore"
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors group cursor-pointer"
                >
                  <Globe className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
                  <span>Explore</span>
                </Link>
                <div className="w-px h-6 bg-slate-200" />
                <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <AvatarImage
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover object-center border-2 border-indigo-200"
                    fallback={
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                        {getInitials(user.name)}
                      </div>
                    }
                    getInitials={getInitials}
                  />
                  <span className="text-sm font-medium text-slate-700">{user.name.split(' ')[0]}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute top-full mt-2 right-0 w-56 bg-white backdrop-blur-xl border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden z-20">
                      {/* User Info */}
                      <div className="p-4 border-b border-slate-200">
                        <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="p-1.5">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            navigate('/profile');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <User className="w-4 h-4" />
                          <span className="text-sm">Profile</span>
                        </button>

                        <button
                          onClick={handleStartSketching}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          <span className="text-sm">Start Sketching</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            navigate('/sketches');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <FolderOpen className="w-4 h-4" />
                          <span className="text-sm">My Sketches</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            navigate('/explore');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <Globe className="w-4 h-4" />
                          <span className="text-sm">Explore</span>
                        </button>

                        <div className="my-1 h-px bg-slate-200" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
            ) : (
              // Not authenticated: Explore + Login
              <>
                <Link
                  to="/explore"
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Explore</span>
                </Link>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-indigo-500 to-purple-500 rounded-xl font-medium text-white hover:from-indigo-400 hover:to-purple-400 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200">
          <div className="px-6 py-4 space-y-3">
            {isAuthenticated && user && (
              <>
                {/* User Info - only when logged in */}
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl mb-2">
                  <AvatarImage
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover object-center border-2 border-indigo-200"
                    fallback={
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                        {getInitials(user.name)}
                      </div>
                    }
                    getInitials={getInitials}
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleStartSketching}
                  className="flex items-center gap-3 w-full px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <span>Start Sketching</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <User className="w-5 h-5 text-indigo-500" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/sketches');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <FolderOpen className="w-5 h-5 text-indigo-500" />
                  <span>My Sketches</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/explore');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <Globe className="w-5 h-5 text-indigo-500" />
                  <span>Explore</span>
                </button>
              </>
            )}

            {!isAuthenticated && (
              <button
                onClick={() => {
                  navigate('/explore');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                <Globe className="w-5 h-5 text-indigo-500" />
                <span>Explore</span>
              </button>
            )}

            <div className="h-px bg-slate-200" />

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            ) : (
                <button
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium"
                >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
