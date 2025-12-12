import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { AuthContextType } from './authTypes';
import type {
  User,
  AuthResponse,
  RegisterData,
  LoginData,
} from '../services/auth';
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  loginWithGoogle as loginWithGoogleApi,
  getMe,
  updateProfile as updateProfileApi,
  changePassword as changePasswordApi,
  initializeAuth,
  tokenStorage,
} from '../services/auth';
import { AuthContext } from './authContext';

// ===================
// Provider
// ===================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ref to prevent double initialization (React StrictMode calls effects twice)
  const initRef = useRef(false);

  // Initialize auth on mount
  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (initRef.current) {
      return;
    }
    initRef.current = true;

    const init = async () => {
      try {
        // First check local storage for cached user
        const cachedUser = tokenStorage.getUser();
        if (cachedUser) {
          setUser(cachedUser);
        }

        // Then verify with server
        const freshUser = await initializeAuth();
        setUser(freshUser);
      } catch (error) {
        console.error('[AuthContext] Init error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Login
  const login = useCallback(async (data: LoginData): Promise<AuthResponse> => {
    const response = await loginApi(data);

    if (response.success && response.data?.user) {
      setUser(response.data.user);
    }

    return response;
  }, []);

  // Register
  const register = useCallback(async (data: RegisterData): Promise<AuthResponse> => {
    const response = await registerApi(data);

    if (response.success && response.data?.user) {
      setUser(response.data.user);
    }

    return response;
  }, []);

  // Login with Google
  const loginWithGoogle = useCallback(async (idToken: string): Promise<AuthResponse> => {
    const response = await loginWithGoogleApi(idToken);

    if (response.success && response.data?.user) {
      setUser(response.data.user);
    }

    return response;
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
  }, []);

  // Update profile
  const updateProfile = useCallback(async (data: { name?: string; avatar?: string }): Promise<AuthResponse> => {
    const response = await updateProfileApi(data);

    if (response.success && response.data?.user) {
      setUser(response.data.user);
    }

    return response;
  }, []);

  // Change password
  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<AuthResponse> => {
    return changePasswordApi(currentPassword, newPassword);
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    const freshUser = await getMe();
    if (freshUser) {
      setUser(freshUser);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

