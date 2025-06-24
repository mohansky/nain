'use client';
// src/contexts/onboarding-context.tsx
import React, { createContext, useContext } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';

// Re-export types from the hook for convenience
export type { OnboardingStep, UserProfileData, ChildData, OnboardingData } from '@/hooks/useOnboarding';

type OnboardingContextType = ReturnType<typeof useOnboarding>;

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const onboardingState = useOnboarding();

  return (
    <OnboardingContext.Provider value={onboardingState}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingContext() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider');
  }
  return context;
}