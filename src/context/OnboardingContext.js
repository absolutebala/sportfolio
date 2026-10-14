import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = '@isportone_profile_v1';

const OnboardingContext = createContext(null);

const initialState = {
  name: '',
  dob: null,
  city: 'Chennai, Tamil Nadu',
  sports: [],
  level: null,
  clubChoice: null,
  selectedClub: null,
  when: [],
  style: [],
  lookingForPartners: true,
  bio: '',
  activities: [],
  moments: [],
  avatarUri: null,
  coverUri: null,
  profileComplete: false, // ← flag: onboarding done
};

export function OnboardingProvider({ children }) {
  const [data, setData] = useState(initialState);
  const [loaded, setLoaded] = useState(false);

  // Load saved profile on startup
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const saved = JSON.parse(raw);
            setData({ ...initialState, ...saved });
          } catch (_) {}
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  function update(patch) {
    setData((prev) => {
      const next = { ...prev, ...patch };
      // Persist every update
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  async function markProfileComplete() {
    update({ profileComplete: true });

    // Sync profile row to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Build a handle from name (fallback to email prefix)
      const rawName = data.name || user.email?.split('@')[0] || 'athlete';
      const handle = rawName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30) || 'athlete';

      await supabase.from('profiles').upsert({
        id: user.id,
        handle,
        name: data.name || rawName,
        bio: data.bio || null,
        city: data.city || null,
        role: data.role || 'athlete',
        level: data.level || null,
        looking_for_partners: data.lookingForPartners ?? true,
        profile_complete: true,
      });

      // Sync sport selections
      if (data.sports?.length) {
        // Get sport IDs from DB
        const { data: sportRows } = await supabase
          .from('sports')
          .select('id, slug')
          .in('slug', data.sports);

        if (sportRows?.length) {
          const profileSports = sportRows.map((s, i) => ({
            profile_id: user.id,
            sport_id: s.id,
            sort_order: i,
          }));
          await supabase.from('profile_sports').upsert(profileSports);
        }
      }
    } catch (e) {
      // Non-fatal: local profile is already saved via AsyncStorage
      console.warn('Supabase profile sync failed:', e.message);
    }
  }

  function logActivity(activity) {
    setData((prev) => {
      const next = { ...prev, activities: [activity, ...prev.activities] };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  function addMoment(moment) {
    setData((prev) => {
      const next = { ...prev, moments: [moment, ...prev.moments] };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  function reset() {
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setData(initialState);
  }

  return (
    <OnboardingContext.Provider
      value={{ data, update, reset, logActivity, addMoment, markProfileComplete, loaded }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within an OnboardingProvider');
  return ctx;
}
