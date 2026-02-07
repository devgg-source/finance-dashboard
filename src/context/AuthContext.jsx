import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, authService } from '../services/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up
  const signUp = useCallback(async (email, password, fullName) => {
    try {
      const data = await authService.signUp(email, password, fullName);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }, []);

  // Sign in
  const signIn = useCallback(async (email, password) => {
    try {
      const data = await authService.signIn(email, password);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email) => {
    try {
      await authService.resetPassword(email);
      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (newPassword) => {
    try {
      await authService.updatePassword(newPassword);
      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates) => {
    try {
      const { data } = await authService.updateProfile(updates);
      setUser(data.user);
      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getUser();
      setUser(user);
      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  // Get user display name
  const getUserDisplayName = useCallback(() => {
    if (!user) return '';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  }, [user]);

  // Get user initials
  const getUserInitials = useCallback(() => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  }, [getUserDisplayName]);

  const value = {
    user,
    session,
    isLoading,
    isInitialized,
    isAuthenticated: !!session,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshUser,
    getUserDisplayName,
    getUserInitials
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
