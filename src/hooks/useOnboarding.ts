'use client';
// src/hooks/useOnboarding.ts
import { useState } from 'react';

export type OnboardingStep = 
  | 'screen-1' 
  | 'screen-2' 
  | 'screen-3' 
  | 'screen-4' 
  | 'profile' 
  | 'language' 
  | 'child-setup' 
  | 'complete';

export interface UserProfileData {
  phone: string;
  language: string;
}

export interface ChildData {
  name: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  headCircumference?: number;
  height?: number;
  weight?: number;
  relationship: 'Dad' | 'Mom' | 'Babysitter' | 'Brother' | 'Sister' | 'Grandparent' | 'Other';
}

export interface OnboardingData {
  profile: UserProfileData;
  children: ChildData[];
}

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('screen-1');
  const [data, setData] = useState<OnboardingData>({
    profile: {
      phone: '',
      language: 'English',
    },
    children: [],
  });

  const updateProfile = (profile: Partial<UserProfileData>) => {
    setData(prev => ({
      ...prev,
      profile: { ...prev.profile, ...profile }
    }));
  };

  const addChild = (child: ChildData) => {
    setData(prev => ({
      ...prev,
      children: [...prev.children, child]
    }));
  };

  const updateChild = (index: number, child: Partial<ChildData>) => {
    setData(prev => ({
      ...prev,
      children: prev.children.map((c, i) => i === index ? { ...c, ...child } : c)
    }));
  };

  const removeChild = (index: number) => {
    setData(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    const steps: OnboardingStep[] = [
      'screen-1', 
      'screen-2', 
      'screen-3', 
      'screen-4', 
      'profile', 
      'language', 
      'child-setup', 
      'complete'
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: OnboardingStep[] = [
      'screen-1', 
      'screen-2', 
      'screen-3', 
      'screen-4', 
      'profile', 
      'language', 
      'child-setup', 
      'complete'
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const goToStep = (step: OnboardingStep) => {
    setCurrentStep(step);
  };

  const skipToDataCollection = () => {
    setCurrentStep('profile');
  };

  const resetOnboarding = () => {
    setCurrentStep('screen-1');
    setData({
      profile: { phone: '', language: 'English' },
      children: [],
    });
  };

  const getStepInfo = () => {
    const steps: OnboardingStep[] = [
      'screen-1', 
      'screen-2', 
      'screen-3', 
      'screen-4', 
      'profile', 
      'language', 
      'child-setup', 
      'complete'
    ];
    const currentIndex = steps.indexOf(currentStep);
    const isWelcomeScreen = ['screen-1', 'screen-2', 'screen-3', 'screen-4'].includes(currentStep);
    const isDataScreen = ['profile', 'language', 'child-setup'].includes(currentStep);
    
    return {
      currentIndex: currentIndex + 1,
      totalSteps: steps.length,
      isWelcomeScreen,
      isDataScreen,
      isFirstStep: currentIndex === 0,
      isLastStep: currentIndex === steps.length - 1,
    };
  };

  return {
    currentStep,
    data,
    updateProfile,
    addChild,
    updateChild,
    removeChild,
    nextStep,
    prevStep,
    goToStep,
    skipToDataCollection,
    resetOnboarding,
    getStepInfo,
  };
}