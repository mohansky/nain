'use client';

import { useState } from 'react';
import { useOnboardingContext } from '@/contexts/onboarding-context';
import OnboardingLayout from './onboarding-layout';
import { useRouter } from 'next/navigation';
import { getErrorMessage } from '@/lib/utils';

export default function StepComplete() {
  const { data, prevStep } = useOnboardingContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete onboarding');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      step={5}
      totalSteps={5}
      title="All set! 🎉"
      subtitle="Review your information and complete your setup"
    >
      <div className="space-y-6">
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {/* Profile Summary */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <h3 className="font-semibold text-base-content mb-3">Your Profile</h3>
            <div className="space-y-2 text-sm">
              {data.profile.phone && (
                <div className="flex justify-between">
                  <span className="text-base-content/70">Phone:</span>
                  <span>{data.profile.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-base-content/70">Language:</span>
                <span>{data.profile.language}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Children Summary */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <h3 className="font-semibold text-base-content mb-3">Your Children</h3>
            <div className="space-y-3">
              {data.children.map((child, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-base-200 rounded-lg">
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content rounded-full w-10">
                      <span className="text-xl">
                        {child.gender === 'Male' ? '👦' : child.gender === 'Female' ? '👧' : '🧒'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{child.name}</div>
                    <div className="text-sm text-base-content/70">
                      {child.relationship} • {child.gender}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="alert alert-success">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="text-sm">
            Your information is secure and will help us provide personalized content for your childs development.
          </span>
        </div>

        <div className="flex gap-3">
          <button
            className="btn btn-outline flex-1"
            onClick={prevStep}
            disabled={isSubmitting}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back
          </button>
          <button
            className={`btn btn-primary flex-1 ${isSubmitting ? 'loading' : ''}`}
            onClick={handleComplete}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Setting up...' : 'Complete Setup'}
            {!isSubmitting && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}