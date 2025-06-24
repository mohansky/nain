"use client";

import { WelcomeLayoutProps } from "@/types";

export default function WelcomeLayout({
  children,
  step,
  totalSteps,
  showProgress = true,
  showSkip = true,
  onSkip,
}: WelcomeLayoutProps) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen pb-20">
      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-md min-h-[calc(100vh-120px)] flex items-center">
        {children}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <div className="text-sm font-medium text-base-content/70">
          {showProgress && `${step} of ${totalSteps}`}
        </div>
        {showSkip && onSkip && (
          <button className="btn btn-ghost btn-sm" onClick={onSkip}>
            Skip
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="px-4 mb-4">
          <progress
            className="progress progress-primary w-full h-2"
            value={progress}
            max={100}
          ></progress>
        </div>
      )}
    </div>
  );
}
