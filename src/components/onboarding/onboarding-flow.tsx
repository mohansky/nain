'use client';

import { useOnboardingContext } from '@/contexts/onboarding-context';
import Screen1 from './screen-1';
import Screen2 from './screen-2';
import Screen3 from './screen-3';
import Screen4 from './screen-4';
import StepProfile from './step-profile';
import StepLanguage from './step-language';
import StepChildSetup from './step-child-setup';
import StepComplete from './step-complete';

export default function OnboardingFlow() {
  const { currentStep } = useOnboardingContext();

  const renderStep = () => {
    switch (currentStep) {
      case 'screen-1':
        return <Screen1 />;
      case 'screen-2':
        return <Screen2 />;
      case 'screen-3':
        return <Screen3 />;
      case 'screen-4':
        return <Screen4 />;
      case 'profile':
        return <StepProfile />;
      case 'language':
        return <StepLanguage />;
      case 'child-setup':
        return <StepChildSetup />;
      case 'complete':
        return <StepComplete />;
      default:
        return <Screen1 />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderStep()}
    </div>
  );
}