import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://pyvghpwvuwvdtlylnusw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5dmdocHd2dXd2ZHRseWxudXN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5NDEwMTUsImV4cCI6MjEwNzUxNzAxNX0.0bmDccUXyfiBA55LkqBx2qeIE5QWWfvHT_M-pKnLstk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
