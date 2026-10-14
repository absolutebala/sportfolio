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

    // Handle deep link callback after OAuth redirect (implicit flow)
    const handleUrl = async ({ url }) => {
      if (!url) return;
      console.log('🟣 deep link received:', url);
      if (url.includes('access_token')) {
        // Implicit flow — tokens are in the URL fragment
        const fragmentMatch = url.match(/#(.+)/);
        const paramStr = fragmentMatch?.[1] || '';
        const params = new URLSearchParams(paramStr);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (accessToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) console.warn('setSession error:', error.message);
        }
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

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    console.log('🟡 result:', JSON.stringify(result));

    if (result.type === 'success') {
      const url = result.url;
      const fragmentMatch = url.match(/#(.+)/);
      const paramStr = fragmentMatch?.[1] || '';
      const params = new URLSearchParams(paramStr);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      console.log('🔑 accessToken found:', !!accessToken);
      if (accessToken) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        console.log('✅ setSession result:', sessionData?.user?.email, sessionError?.message);
        if (sessionError) throw sessionError;
        // Manually update state in case onAuthStateChange doesn't fire
        if (sessionData?.session) {
          setSession(sessionData.session);
          setUser(sessionData.session.user);
        }
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
