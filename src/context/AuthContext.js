import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Handle deep link callback after OAuth redirect
    const handleUrl = async ({ url }) => {
      if (url?.includes('access_token') || url?.includes('code=')) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(url);
        if (error) console.warn('OAuth callback error:', error.message);
      }
    };

    const sub = Linking.addEventListener('url', handleUrl);
    return () => {
      subscription.unsubscribe();
      sub.remove();
    };
  }, []);

  async function signInWithGoogle() {
    // In Expo Go, the redirect URL is always exp://IP:port/--/path
    // Supabase has exp://** whitelisted which covers any IP.
    const redirectUrl = AuthSession.makeRedirectUri({ path: 'auth/callback' });
    console.log('🔵 redirectUrl:', redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    console.log('🟢 OAuth URL:', data.url);

    // openBrowserAsync just opens the browser; the deep link listener
    // in useEffect handles the callback when Supabase redirects back.
    await WebBrowser.openBrowserAsync(data.url);
    console.log('🟡 browser opened');
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

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
