"use client";

import { OnboardingLayoutProps } from "@/types";

export default function OnboardingLayout({
  children,
  step,
  totalSteps,
  title,
  subtitle,
}: OnboardingLayoutProps) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen">
      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-base-content mb-2">{title}</h1>
          {subtitle && (
            <p className="text-base-content/70 text-sm leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
      {/* Progress Header */}
      <div className="z-50 border-b border-base-300  pb-20 ">
        <div className="container mx-auto px-4 py-4 max-w-md">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-base-content/70">
              Step {step} of {totalSteps}
            </div>
            <div className="text-sm font-medium text-base-content/70">
              {Math.round(progress)}%
            </div>
          </div>
          <progress
            className="progress progress-primary w-full h-2"
            value={progress}
            max={100}
          ></progress>
        </div>
      </div>
    </div>
  );
}
