import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace these with your new Supabase project credentials
const SUPABASE_URL = 'https://gzoqjozdvvsogfflktfe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6b3Fqb3pkdnZzb2dmZmxrdGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1ODk1MTksImV4cCI6MjEwODE2NTUxOX0.SUDy4JesA3etttWKz3YoVsAcpGCkMgaDMA8gFM6S7Vc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // PKCE is the default — do not set flowType: 'implicit'
  },
});
