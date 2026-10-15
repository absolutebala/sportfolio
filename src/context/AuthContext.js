import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

const REDIRECT_URI = 'com.idataone.sportfolio://auth/callback';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  // Prevent getSession() from overwriting a session already set by onAuthStateChange
  const sessionReady = useRef(false);

  useEffect(() => {
    // 1. Listen for auth state changes — this is the single source of truth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 onAuthStateChange:', event, session?.user?.email ?? 'no user');
      sessionReady.current = true;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Seed initial state from persisted session (AsyncStorage)
    //    Only applies if onAuthStateChange hasn't already fired
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!sessionReady.current) {
        console.log('📦 getSession seed:', session?.user?.email ?? 'no session');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    const redirectUrl = makeRedirectUri().startsWith('exp://')
      ? makeRedirectUri({ path: 'auth/callback' })
      : REDIRECT_URI;

    console.log('🔵 redirectUrl:', redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
    });
    if (error) throw error;

    console.log('🟢 OAuth URL:', data.url);
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    console.log('🟡 browser result type:', result.type);

    if (result.type !== 'success') {
      if (result.type === 'cancel') throw new Error('Sign-in was cancelled.');
      return;
    }

    // Extract tokens from the redirect URL fragment
    const fragment = result.url.split('#')[1] ?? '';
    const params = new URLSearchParams(fragment);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    console.log('🔑 accessToken present:', !!accessToken);
    if (!accessToken) {
      console.warn('⚠️ No access_token in redirect URL');
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      console.warn('❌ setSession error:', sessionError.message);
      throw sessionError;
    }

    console.log('✅ setSession ok:', sessionData?.user?.email);
    // onAuthStateChange will fire and update state — but set it directly too as a fallback
    if (sessionData?.session) {
      sessionReady.current = true;
      setSession(sessionData.session);
      setUser(sessionData.session.user);
    }
  }

  async function signOut() {
    sessionReady.current = false;
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
