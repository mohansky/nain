'use client';
// src/components/onboarding/step-child-setup.tsx
import { useState } from 'react';
import { useOnboardingContext, type ChildData } from '@/contexts/onboarding-context';
import OnboardingLayout from './onboarding-layout';

const relationships = [
  { value: 'Mom' as const, label: 'Mom', icon: '👩‍👧‍👦' },
  { value: 'Dad' as const, label: 'Dad', icon: '👨‍👧‍👦' },
  { value: 'Brother' as const, label: 'Brother', icon: '👦' },
  { value: 'Sister' as const, label: 'Sister', icon: '👧' },
  { value: 'Grandparent' as const, label: 'Grandparent', icon: '👴' },
  { value: 'Babysitter' as const, label: 'Babysitter', icon: '👤' },
  { value: 'Other' as const, label: 'Other', icon: '👤' },
];

export default function StepChildSetup() {
  const { addChild, nextStep, prevStep } = useOnboardingContext();
  const [childName, setChildName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [relationship, setRelationship] = useState<ChildData['relationship']>('Mom');

  const maxDate = new Date().toISOString().split('T')[0];

  const isValid = childName.trim().length >= 2 && dateOfBirth;

  const handleContinue = () => {
    if (isValid) {
      const child: ChildData = {
        name: childName.trim(),
        dateOfBirth,
        gender,
        relationship,
      };
      addChild(child);
      nextStep();
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    const diffInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} old`;
    } else {
      const years = Math.floor(diffInMonths / 12);
      const months = diffInMonths % 12;
      return `${years} year${years !== 1 ? 's' : ''}${months > 0 ? ` ${months} month${months !== 1 ? 's' : ''}` : ''} old`;
    }
  };

  return (
    <OnboardingLayout
      step={4}
      totalSteps={5}
      title="Tell us about your child"
      subtitle="Add your first child's basic information. You can add more children later."
    >
      <div className="space-y-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Childs Name</span>
          </label>
          <input
            type="text"
            placeholder="Enter child's name"
            className="input input-bordered w-full"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Date of Birth</span>
          </label>
          <input
            type="date"
            className="input input-bordered w-full"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            max={maxDate}
          />
          {dateOfBirth && (
            <label className="label">
              <span className="label-text-alt text-primary">
                {calculateAge(dateOfBirth)}
              </span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Gender</span>
          </label>
          <div className="flex gap-2">
            {(['Male', 'Female', 'Other'] as const).map((option) => (
              <label
                key={option}
                className={`flex-1 p-3 rounded-lg border-2 cursor-pointer text-center transition-all ${
                  gender === option
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-base-300 hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={option}
                  checked={gender === option}
                  onChange={(e) => setGender(e.target.value as typeof gender)}
                  className="hidden"
                />
                <span className="font-medium">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Your relationship</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {relationships.map((rel) => (
              <label
                key={rel.value}
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  relationship === rel.value
                    ? 'border-primary bg-primary/10'
                    : 'border-base-300 hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="relationship"
                  value={rel.value}
                  checked={relationship === rel.value}
                  onChange={(e) => setRelationship(e.target.value as typeof relationship)}
                  className="hidden"
                />
                <span className="text-lg mr-2">{rel.icon}</span>
                <span className="font-medium text-sm">{rel.label}</span>
              </label>
            ))}
          </div>
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
            className={`btn btn-primary flex-1 ${!isValid ? 'btn-disabled' : ''}`}
            onClick={handleContinue}
            disabled={!isValid}
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