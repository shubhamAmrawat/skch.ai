import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { LandingPage } from '../pages/LandingPage';
import { useAuth } from '../hooks/useAuth';

/**
 * Renders the landing page for unauthenticated users.
 * Redirects to /home (dashboard) if the user is logged in.
 */
export function LandingRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <LandingPage />;
}
