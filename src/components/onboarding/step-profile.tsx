'use client';

import { useState } from 'react';
import { useOnboardingContext } from '@/contexts/onboarding-context';
import OnboardingLayout from './onboarding-layout';
import { isValidPhone } from '@/lib/utils';

export default function StepProfile() {
  const { data, updateProfile, nextStep } = useOnboardingContext();
  const [phone, setPhone] = useState(data.profile.phone);
  const [phoneError, setPhoneError] = useState('');

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setPhoneError('');
  };

  const handleContinue = () => {
    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
      setPhoneError('Please enter a valid phone number');
      return;
    }

    updateProfile({ phone });
    nextStep();
  };

  return (
    <OnboardingLayout
      step={2}
      totalSteps={5}
      title="Let's start with your phone"
      subtitle="We'll use this to send you important updates about your child's development"
    >
      <div className="space-y-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Phone Number (Optional)</span>
          </label>
          <input
            type="tel"
            placeholder="+91 98765 43210"
            className={`input input-bordered w-full text-lg ${
              phoneError ? 'input-error' : phone && isValidPhone(phone) ? 'input-success' : ''
            }`}
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
          />
          {phoneError && (
            <label className="label">
              <span className="label-text-alt text-error">{phoneError}</span>
            </label>
          )}
        </div>

        <div className="alert alert-info">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="text-sm">
            Your phone number is optional but helps us send important notifications.
          </span>
        </div>

        <button
          className="btn btn-primary w-full"
          onClick={handleContinue}
        >
          Continue
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </OnboardingLayout>
  );
}