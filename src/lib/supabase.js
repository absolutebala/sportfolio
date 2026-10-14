/**
 * Supabase client
 *
 * 1. Go to https://supabase.com/dashboard → your project → Settings → API
 * 2. Copy "Project URL" → SUPABASE_URL
 * 3. Copy "anon / public" key → SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,          // persists session across app restarts
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,      // must be false for React Native
    flowType: 'implicit',           // avoid PKCE code verifier mismatch in Expo Go
  },
});
