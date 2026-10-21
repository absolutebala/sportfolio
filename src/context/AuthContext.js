import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

// Must match exactly what's registered in Supabase → Auth → URL Configuration → Redirect URLs
export const REDIRECT_URL = 'com.idataone.sportfolio://auth/callback';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);   // undefined = not yet known
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    // Single source of truth — all auth state flows through here
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] event:', event, '| user:', session?.user?.email ?? 'none');
      setSession(session ?? null);
      setUser(session?.user ?? null);
    });

    // Restore persisted session from AsyncStorage on first launch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(prev => prev === undefined ? (session ?? null) : prev);
      setUser(prev => prev === undefined ? (session?.user ?? null) : prev);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: REDIRECT_URL,
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;

    const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URL);
    console.log('[Auth] browser result:', result.type);

    if (result.type === 'success') {
      // PKCE: exchange the code in the redirect URL for a session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(result.url);
      if (exchangeError) throw exchangeError;
      // onAuthStateChange fires automatically after successful exchange
    } else if (result.type === 'cancel') {
      throw new Error('Sign-in was cancelled.');
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const loading = user === undefined || session === undefined;

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
