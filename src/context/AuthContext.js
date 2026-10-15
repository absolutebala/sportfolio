import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

// Must match exactly what's registered in Supabase → Authentication → URL Configuration
const REDIRECT_URL = 'com.idataone.sportfolio://auth/callback';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = not yet known
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    // onAuthStateChange is the single source of truth for user state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] event:', event, '| user:', session?.user?.email ?? 'none');
      setSession(session ?? null);
      setUser(session?.user ?? null);
    });

    // Kick-start by restoring any persisted session from AsyncStorage
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Only set if onAuthStateChange hasn't already fired (state still undefined)
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
    console.log('[Auth] opening browser for OAuth...');

    const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URL);
    console.log('[Auth] browser result:', result.type);

    if (result.type === 'success') {
      // Let Supabase handle the callback URL — it will parse the code/token
      // and fire onAuthStateChange automatically
      const { error } = await supabase.auth.exchangeCodeForSession(result.url);
      if (error) {
        // PKCE exchange failed — fall back to parsing tokens from URL fragment (implicit)
        console.warn('[Auth] exchangeCodeForSession failed, trying fragment parse:', error.message);
        const fragment = result.url.split('#')[1] ?? '';
        const params = new URLSearchParams(fragment);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token) {
          const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
          if (sessionError) throw sessionError;
        }
      }
    } else if (result.type === 'cancel') {
      throw new Error('Sign-in was cancelled.');
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  // loading = true while we don't yet know the auth state
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
