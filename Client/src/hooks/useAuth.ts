import { useContext } from 'react';
import { AuthContext } from '../context/authContext';
import type { AuthContextType } from '../context/authTypes';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
