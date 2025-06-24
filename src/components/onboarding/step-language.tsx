'use client';

import { useState } from 'react';
import { useOnboardingContext } from '@/contexts/onboarding-context';
import OnboardingLayout from './onboarding-layout';

const languages = [
  { value: 'English', label: 'English', flag: '🇺🇸' },
  { value: 'Hindi', label: 'हिंदी', flag: '🇮🇳' },
  { value: 'Assamese', label: 'অসমীয়া', flag: '🇮🇳' },
  { value: 'Bengali', label: 'বাংলা', flag: '🇮🇳' },
  { value: 'Kannada', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { value: 'Tamil', label: 'தமிழ்', flag: '🇮🇳' },
  { value: 'Marathi', label: 'मराठी', flag: '🇮🇳' },
];

export default function StepLanguage() {
  const { data, updateProfile, nextStep, prevStep } = useOnboardingContext();
  const [selectedLanguage, setSelectedLanguage] = useState(data.profile.language);

  const handleContinue = () => {
    updateProfile({ language: selectedLanguage });
    nextStep();
  };

  return (
    <OnboardingLayout
      step={3}
      totalSteps={5}
      title="Choose your language"
      subtitle="Select your preferred language for the app interface and content"
    >
      <div className="space-y-6">
        <div className="grid gap-3">
          {languages.map((language) => (
            <label
              key={language.value}
              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedLanguage === language.value
                  ? 'border-primary bg-primary/10'
                  : 'border-base-300 hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                name="language"
                value={language.value}
                checked={selectedLanguage === language.value}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="radio radio-primary mr-4"
              />
              <div className="flex items-center space-x-3 flex-1">
                <span className="text-2xl">{language.flag}</span>
                <div>
                  <div className="font-medium text-base-content">
                    {language.label}
                  </div>
                  {language.value !== language.label && (
                    <div className="text-sm text-base-content/60">
                      {language.value}
                    </div>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            className="btn btn-outline flex-1"
            onClick={prevStep}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back
          </button>
          <button
            className="btn btn-primary flex-1"
            onClick={handleContinue}
          >
            Continue
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}