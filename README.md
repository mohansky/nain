User Account:
Name
Phone
Email
Relationship: Dad | Mom | Babysitter | Brother | Sister 
Language: English | Hindi | Assamese | Bengali | Kannada | Tamil | Marathi | Kannada |
Child Id: Child's unique id
With an option to add more child profiles

One child can be connected to multiple user accounts with differen roles.

Child Profile:
Name
Date of birth
Gender
Head Circumference
Height
Weight
Milestone Photos
Activities



Strategic Component Selection
Here's my recommendation for which library to use for different components:
Use DaisyUI for:

Layout components: navbar, footer, drawer, hero
Form components: input, textarea, select, checkbox, radio, toggle
Feedback components: alert, toast, loading, progress
Navigation: tabs, breadcrumbs, pagination
Data display: table, stats, timeline, carousel

Use shadcn/ui for:

Complex interactions: dialog, dropdown-menu, popover, tooltip
Advanced form components: date-picker, calendar, combobox
Data entry: command palette, search
Specialized components: data-table, charts



@import "tailwindcss";

@custom-variant dark (&:is(.dark *));
@plugin "daisyui" {
  themes: evilwizard --default, dark --prefersdark, evilwizard;
}

@plugin "daisyui/theme" {
  name: "evilwizard";
  default: false;
  prefersdark: false;
  color-scheme: "light";
  --color-base-100: oklch(98% 0 0);
  --color-base-200: oklch(96% 0.001 286.375);
  --color-base-300: oklch(92% 0.004 286.32);
  --color-base-content: oklch(21% 0.006 285.885);
  --color-primary: oklch(51% 0.262 276.966);
  --color-primary-content: oklch(96% 0.018 272.314); 
  --color-secondary: oklch(54% 0.245 262.881);
  --color-secondary-content: oklch(97% 0.014 254.604);
  --color-accent: oklch(54% 0.281 293.009);
  --color-accent-content: oklch(96% 0.016 293.756);
  --color-neutral: oklch(27% 0.006 286.033);
  --color-neutral-content: oklch(98% 0 0);
  --color-info: oklch(58% 0.158 241.966);
  --color-info-content: oklch(97% 0.013 236.62);
  --color-success: oklch(59% 0.145 163.225);
  --color-success-content: oklch(97% 0.021 166.113);
  --color-warning: oklch(68% 0.162 75.834);
  --color-warning-content: oklch(98% 0.026 102.212);
  --color-error: oklch(57% 0.245 27.325);
  --color-error-content: oklch(97% 0.013 17.38);
  --radius-selector: 0.5rem;
  --radius-field: 2rem;
  --radius-box: 1rem;
  --size-selector: 0.25rem;
  --size-field: 0.25rem;
  --border: 2px;
  --depth: 1;
  --noise: 0;
}

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}



import { safeImageSrc } from '@/lib/utils';

// Safe usage:
const imageSrc = safeImageSrc(session.user.image);

{imageSrc ? (
  <Image src={imageSrc} alt="Profile" width={40} height={40} />
) : (
  <div className="fallback-avatar">...</div>
)}



    alert-dialog
    avatar
    checkbox
    dialog
    dropdown-menu
    label
    radio-group
    select
    separator
    slot


  radius-selector, radius-field, radius-box, size-selector, size-field, border, depth, noise

  Something's Fishy
  Downstream Delights
  Fishy Business Treats
  Gone Fishing Cookies


  Ok I'll change it but now just on the front end in the sense what you see on the website and in the email. On the backend it will still just be ymy-cookies because it may conflict with existing orders if I change it there too. Do you need sometime to confirm or should I just change it?

  Also I need to set up google tag manager and search console for tracking I'll get to that sometime this week will need the godaddu OTP then.