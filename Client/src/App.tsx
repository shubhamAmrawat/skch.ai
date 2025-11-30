import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { SketchApp } from './pages/SketchApp';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { MySketchesPage } from './pages/MySketchesPage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />

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
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
