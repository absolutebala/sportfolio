import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  function markProfileComplete() {
    update({ profileComplete: true });
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
