'use client';

import { useEffect, useState } from 'react';
import { CareerProfile, getCareerProfile } from '@/lib/api';

const PROFILE_ID_KEY = 'ai-career-copilot-profile-id';

type ProfileMeta = {
  aiProvider: string;
  storage: string;
};

export function useCareerProfile() {
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [meta, setMeta] = useState<ProfileMeta | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (typeof window === 'undefined') {
        setIsBootstrapping(false);
        return;
      }

      const savedId = window.localStorage.getItem(PROFILE_ID_KEY);
      if (!savedId) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const result = await getCareerProfile(savedId);
        setProfile(result.profile);
      } catch {
        window.localStorage.removeItem(PROFILE_ID_KEY);
        setError('We could not load your saved profile. Please analyze your resume again.');
      } finally {
        setIsBootstrapping(false);
      }
    };

    void load();
  }, []);

  const persistProfile = (nextProfile: CareerProfile, nextMeta?: ProfileMeta | null) => {
    setProfile(nextProfile);
    if (nextMeta) {
      setMeta(nextMeta);
    }
    setError(null);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PROFILE_ID_KEY, nextProfile.id);
    }
  };

  const clearProfile = () => {
    setProfile(null);
    setMeta(null);
    setError(null);

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(PROFILE_ID_KEY);
    }
  };

  return {
    profile,
    meta,
    error,
    isBootstrapping,
    setMeta,
    persistProfile,
    clearProfile,
  };
}
