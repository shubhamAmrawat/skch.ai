import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthProvider';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import { LandingRoute } from './components/LandingRoute';
import { SketchApp } from './pages/SketchApp';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { MySketchesPage } from './pages/MySketchesPage';
import { ProfilePage } from './pages/ProfilePage';
import { ExplorePage } from './pages/ExplorePage';
import { Analytics } from '@vercel/analytics/react';
import { ComponentLibraryPage } from './pages/ComponentLibraryPage';
// Get Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Landing - redirects to /home if logged in */}
            <Route path="/" element={<LandingRoute />} />

            {/* Dashboard - protected, for logged-in users */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Auth routes - redirect to app if already logged in */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicOnlyRoute>
                  <SignupPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicOnlyRoute>
                  <ForgotPasswordPage />
                </PublicOnlyRoute>
              }
            />

            {/* Protected routes - require authentication */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <SketchApp />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sketches"
              element={
                <ProtectedRoute>
                  <MySketchesPage />
                </ProtectedRoute>
              }
            />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/library" element={<ComponentLibraryPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Analytics />
        </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
