// src/components/icons/user-icon.tsx
import React from 'react';
import { IconProps } from '@/types';
import { cn } from '@/lib/utils';

export const UserIcon: React.FC<IconProps> = ({ 
  className, 
  size = 24,
  variant = 'default',
  color,
  ...props 
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "lucide lucide-user",
        color && {
          'text-primary': color === 'primary',
          'text-secondary': color === 'secondary',
          'text-accent': color === 'accent',
          // ... other colors
        },
        variant === 'filled' && 'fill-current',
        className
      )}
      {...props}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
};