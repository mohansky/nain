'use client';
// src/hooks/useUserProfile.ts
import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/utils';
import type { User, UserProfile } from '@/types';

interface UserProfileData {
  user: User | null;
  userProfile: UserProfile | null;
}

interface UseUserProfileReturn {
  data: UserProfileData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUserProfile(): UseUserProfileReturn {
  const { data: session } = useSession();
  const [data, setData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!session?.user) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/user/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await response.json();
      setData(profileData);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user]);

  const refetch = () => {
    fetchProfile();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}