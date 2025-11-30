import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderOpen, LogIn, Menu, X } from 'lucide-react';
import { Logo } from './Logo';

export function LandingHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="group">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {/* My Sketches */}
            <button
              onClick={() => navigate('/sketches')}
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors group"
            >
              <FolderOpen className="w-4 h-4 group-hover:text-indigo-400 transition-colors" />
              <span>My Sketches</span>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-800" />

            {/* Login Button */}
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-indigo-500 to-purple-500 rounded-xl font-medium text-white hover:from-indigo-400 hover:to-purple-400 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-800">
          <div className="px-6 py-4 space-y-3">
            <button
              onClick={() => {
                navigate('/sketches');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all"
            >
              <FolderOpen className="w-5 h-5 text-indigo-400" />
              <span>My Sketches</span>
            </button>

            <div className="h-px bg-slate-800" />

            <button
              onClick={() => {
                navigate('/login');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium"
            >
              <LogIn className="w-5 h-5" />
              <span>Login</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
