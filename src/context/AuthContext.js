import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
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
      console.log('🔄 onAuthStateChange:', _event, session?.user?.email ?? 'no user');
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function signInWithGoogle() {
    // Standalone APK uses the app scheme; Expo Go uses exp://
    const isExpoGo = AuthSession.makeRedirectUri().startsWith('exp://');
    const redirectUrl = isExpoGo
      ? AuthSession.makeRedirectUri({ path: 'auth/callback' })
      : 'com.idataone.sportfolio://auth/callback';
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
