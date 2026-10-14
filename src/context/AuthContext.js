import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
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
    // Use the app's deep link scheme as redirect
    const redirectUrl = Linking.createURL('/auth/callback');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

    if (result.type === 'success') {
      // Parse tokens from URL fragment or query params
      const url = result.url;

      // Try fragment first (implicit flow)
      const fragmentMatch = url.match(/#(.+)/);
      const queryMatch = url.match(/\?(.+)/);
      const paramStr = fragmentMatch?.[1] || queryMatch?.[1] || '';
      const params = new URLSearchParams(paramStr);

      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) throw sessionError;
      } else {
        // PKCE flow — exchange code
        await supabase.auth.exchangeCodeForSession(url);
      }
    } else if (result.type === 'cancel') {
      throw new Error('Sign-in was cancelled.');
    }
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
