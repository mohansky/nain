// src/types/index.ts

import { IconifyIcon } from "@iconify/react/dist/iconify.js";
import { StaticImageData } from "next/image";
import React, { ReactNode } from "react";

// =============================================
// UTILITY TYPES
// =============================================

export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassValue[];

// =============================================
// ICON TYPES
// =============================================

export interface BaseIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

export interface IconProps extends BaseIconProps {
  // Additional icon-specific props can be added here
  variant?: "default" | "outlined" | "filled";
  color?:
    | "primary"
    | "secondary"
    | "accent"
    | "neutral"
    | "info"
    | "success"
    | "warning"
    | "error";
}

// export type ActivityCategory =
//   | "play"
//   | "learning"
//   | "exercise"
//   | "meal"
//   | "sleep"
//   | "medical"
//   | "social"
//   | "creative"
//   | "outdoor"
//   | "other";
// =============================================
// COMPONENT TYPES
// =============================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonVariants {
  variant?: "primary" | "secondary" | "accent" | "ghost" | "link" | "outline";
  size?: "xs" | "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  compact?: boolean;
}

// =============================================
// FORM TYPES
// =============================================

export interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface InputProps extends FormFieldProps {
  type?: "text" | "email" | "password" | "tel" | "url" | "search";
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends FormFieldProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  multiple?: boolean;
}

export interface ActivityCategories {
  value: ActivityCategory;
  label: string;
  icon: string;
}

// export interface ActivityData {
//   childId: string;
//   title: string;
//   description?: string;
//   duration?: number;
//   category: ActivityCategory;
//   recordedAt: Date;
//   image?: string | null;
// }

// // Add to your types file
// export interface ActivityFormData {
//   childId: string;
//   title: string;
//   description?: string;
//   category: ActivityCategory;
//   duration?: number;
//   recordedAt: string; // ISO string format
//   image?: string | null;
// }

// export interface CreateActivityRequest extends ActivityFormData {
//   childId: string;
// }

// export interface ActivityFormProps {
//   activity?: ActivityData | null;
//   childId: string;
//   onSubmit: (data: ActivityData) => Promise<boolean>;
//   onCancel: () => void;
//   isLoading?: boolean;
// }

export interface ActivityCategories {
  value:
    | "play"
    | "learning"
    | "exercise"
    | "meal"
    | "sleep"
    | "medical"
    | "social"
    | "creative"
    | "outdoor"
    | "other";
  label: string;
  icon: string; 
}

export type ActivityCategory =
  | "play"
  | "learning"
  | "exercise"
  | "meal"
  | "sleep"
  | "medical"
  | "social"
  | "creative"
  | "outdoor"
  | "other";

export interface Activity {
  id: string;
  childId: string;
  title: string;
  description?: string;
  duration?: number;
  category: ActivityCategory;
  recordedAt: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ActivityFormState = {
  success: boolean;
  message?: string;
  errors?:
    | {
        title?: string[];
        description?: string[];
        duration?: string[];
        category?: string[];
        recordedAt?: string[];
        childId?: string[];
        image?: string[];
        _form?: string[];
      }
    | string;
  data?: unknown;
};

export interface MilestoneData {
  childId: string;
  title: string;
  description?: string;
  achievedAt: Date;
  photos?: string[];
}

export interface MilestoneFormProps {
  milestone?: MilestoneData | null;
  childId: string;
  onSubmit: (data: MilestoneData) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

// =============================================
// LAYOUT TYPES
// =============================================

export interface LayoutProps extends BaseComponentProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnBackdrop?: boolean;
}

// =============================================
// NAVIGATION TYPES
// =============================================

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<IconProps>;
  active?: boolean;
  disabled?: boolean;
  badge?: string | number;
}

export interface NavLink {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

// =============================================
// DATA TYPES
// =============================================

// export interface PaginationProps {
//   currentPage: number;
//   totalPages: number;
//   onPageChange: (page: number) => void;
//   showFirstLast?: boolean;
//   showPrevNext?: boolean;
// }

// export interface TableColumn<T = any> {
//   key: keyof T;
//   label: string;
//   sortable?: boolean;
//   render?: (value: any, item: T) => React.ReactNode;
// }

// export interface TableProps<T = any> {
//   data: T[];
//   columns: TableColumn<T>[];
//   loading?: boolean;
//   emptyMessage?: string;
//   onRowClick?: (item: T) => void;
// }

// =============================================
// THEME TYPES
// =============================================

// export type DaisyUIThemes =
//   | 'light' | 'dark' | 'cupcake' | 'bumblebee' | 'emerald' | 'corporate'
//   | 'synthwave' | 'retro' | 'cyberpunk' | 'valentine' | 'halloween' | 'garden'
//   | 'forest' | 'aqua' | 'lofi' | 'pastel' | 'fantasy' | 'wireframe' | 'black'
//   | 'luxury' | 'dracula' | 'cmyk' | 'autumn' | 'business' | 'acid' | 'lemonade'
//   | 'night' | 'coffee' | 'winter';

// export interface ThemeConfig {
//   theme: DaisyUIThemes;
//   darkMode?: boolean;
// }

// =============================================
// USER & AUTH TYPES
// =============================================

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  phone?: string;
  avatar?: string;
  language: Language;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: number;
  fallback?: string;
  className?: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
  phone?: string;
  language?: Language;
}

export interface UpdateUserProfileResponse {
  success: boolean;
  user?: User;
  userProfile?: UserProfile;
  error?: string;
}

export interface UserWithProfile extends User {
  profile?: UserProfile;
}

export type Language =
  | "English"
  | "Hindi"
  | "Assamese"
  | "Bengali"
  | "Kannada"
  | "Tamil"
  | "Marathi";

export type Relationship =
  | "Dad"
  | "Mom"
  | "Babysitter"
  | "Brother"
  | "Sister"
  | "Grandparent"
  | "Other";

export type Gender = "Male" | "Female" | "Other";

// =============================================
// CHILD & FAMILY TYPES
// =============================================

export interface Child {
  id: string;
  name: string;
  dateOfBirth: Date;
  gender: Gender;
  headCircumference?: number;
  height?: number;
  weight?: number;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserChildRelation {
  id: string;
  userId: string;
  childId: string;
  relationship: Relationship;
  isPrimary: boolean;
  createdAt: Date;
}

// =============================================
// MILESTONE TYPES
// =============================================

export interface Milestone {
  id: string;
  childId: string;
  title: string;
  description?: string;
  achievedAt: Date;
  photos?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// =============================================
// ACTIVITY TYPES
// =============================================

export interface Activity {
  id: string;
  childId: string;
  title: string;
  description?: string;
  duration?: number;
  category: ActivityCategory;
  image?: string;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityCardProps {
  title: string;
  image?: string | StaticImageData;
  description?: string;
  icon?: string | IconifyIcon;
}

// =============================================
// ONBOARDING TYPES
// =============================================

export type OnboardingStep =
  | "screen-1"
  | "profile"
  | "language"
  | "child-setup"
  | "child-details"
  | "complete";

export interface OnboardingProfile {
  phone: string;
  language: Language;
}

export interface OnboardingChild {
  name: string;
  dateOfBirth: Date;
  gender: Gender;
  headCircumference?: number;
  height?: number;
  weight?: number;
  relationship: Relationship;
}

export interface OnboardingData {
  profile: OnboardingProfile;
  children: OnboardingChild[];
}

export interface OnboardingUserProfileData {
  phone: string;
  language: Language;
}

export interface OnboardingChildData {
  name: string;
  dateOfBirth: string;
  gender: Gender;
  headCircumference?: number;
  height?: number;
  weight?: number;
  relationship: Relationship;
}

export interface OnboardingFormData {
  profile: OnboardingUserProfileData;
  children: OnboardingChildData[];
}

export interface OnboardingLayoutProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
}

export interface WelcomeLayoutProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
  showProgress?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
}

// =============================================
// Child Management Types
// =============================================

export interface ChildWithRelation {
  id: string;
  name: string;
  dateOfBirth: Date | string;
  gender: Gender;
  headCircumference?: number | null;
  height?: number | null;
  weight?: number | null;
  profileImage?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Relation info
  relationId: string;
  relationship: Relationship;
  isPrimary: boolean;
  relationCreatedAt: Date;
}

export interface ChildCardProps {
  child: ChildWithRelation;
  onEdit: (child: ChildWithRelation) => void;
  onDelete: (child: ChildWithRelation) => void;
}

export interface ChildCardButtonProps {
  child: ChildWithRelation;
}

export interface CreateChildRequest {
  name: string;
  dateOfBirth: Date | string;
  gender: Gender;
  headCircumference?: number;
  height?: number;
  weight?: number;
  relationship: Relationship;
  isPrimary?: boolean;
}

export interface UpdateChildRequest {
  name?: string;
  dateOfBirth?: Date | string;
  gender?: Gender;
  headCircumference?: number;
  height?: number;
  weight?: number;
  relationship?: Relationship;
  isPrimary?: boolean;
}

export interface ChildFormData {
  name: string;
  profileImage?: string;
  dateOfBirth: string;
  gender: Gender;
  headCircumference: string;
  height: string;
  weight: string;
  relationship: Relationship;
  isPrimary: boolean;
}

export interface ChildFormProps {
  child?: ChildWithRelation | null;
  onSubmit: (data: {
    name: string;
    dateOfBirth: Date | string;
    gender: Gender;
    profileImage?: File | string | null;
    // profileImage?: File | null;
    headCircumference?: number;
    height?: number;
    weight?: number;
    relationship: Relationship;
    isPrimary: boolean;
  }) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface ChildFormProps {
  child?: ChildWithRelation | null;
  onSubmit: (data: ChildFormSubmission) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface ChildSubmissionData {
  name: string;
  dateOfBirth: Date | string;
  gender: Gender;
  profileImage?: string | File | null;
  headCircumference?: number;
  height?: number;
  weight?: number;
  relationship: Relationship;
  isPrimary: boolean;
}

export interface ChildFormSubmission {
  name: string;
  dateOfBirth: Date | string;
  gender: Gender;
  profileImage?: File | string | null;
  headCircumference?: number;
  height?: number;
  weight?: number;
  relationship: Relationship;
  isPrimary: boolean;
}


// Types for update operations
export interface ChildUpdateData {
  updatedAt: Date;
  name?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  headCircumference?: number | null;
  height?: number | null;
  weight?: number | null;
  profileImage?: string | null; // Store URL string, not file
}

export interface RelationUpdateData {
  relationship?: Relationship;
  isPrimary?: boolean;
}

// =============================================
// API TYPES
// =============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// =============================================
// UTILITY FUNCTION TYPES
// =============================================

// export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// export interface AsyncState<T> {
//   data: T | null;
//   loading: boolean;
//   error: string | null;
// }

// =============================================
// EVENT TYPES
// =============================================

// export interface SelectChangeEvent {
//   value: string;
//   option: SelectOption;
// }

// export interface FormSubmitEvent<T = any> {
//   data: T;
//   isValid: boolean;
//   errors: Record<string, string>;
// }

// =============================================
// EXPORT ALL TYPES
// =============================================

// export type {
//   React,
// };

// Default export for easier importing
// export default {
//   Icon: {} as IconProps,
//   Component: {} as BaseComponentProps,
//   User: {} as User,
//   Child: {} as Child,
// };
