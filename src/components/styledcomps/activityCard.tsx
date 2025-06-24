// src/components/styledcomps/activityCard.tsx
import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  MessageCircle, 
  Calculator, 
  MapPin, 
  Gamepad2, 
  BookOpen, 
  Gift, 
  Film, 
  Music, 
  Tv,
  Syringe,
  TrendingUp,
  LucideIcon
} from 'lucide-react';
import Image from 'next/image';

type CategoryType = 
  | 'Physical Growth Milestones'
  | 'Vaccines'
  | 'Mental Growth'
  | 'Language'
  | 'Maths'
  | 'Geography'
  | 'Activities/Games'
  | 'Books'
  | 'Toys'
  | 'Movies'
  | 'Rhymes/Songs'
  | 'Screen Time (+Suggested Content)';

interface CategoryConfig {
  color: string;
  icon: LucideIcon;
  bgClass: string;
}

interface ActivityCardProps {
  description: string;
  category: string;
  image: string | null;
}

const categoryConfig: Record<CategoryType, CategoryConfig> = {
  'Physical Growth Milestones': {
    color: 'bg-blue-100 border-blue-200 text-blue-800',
    icon: TrendingUp,
    bgClass: 'bg-blue-50'
  },
  'Vaccines': {
    color: 'bg-red-100 border-red-200 text-red-800',
    icon: Syringe,
    bgClass: 'bg-red-50'
  },
  'Mental Growth': {
    color: 'bg-purple-100 border-purple-200 text-purple-800',
    icon: Brain,
    bgClass: 'bg-purple-50'
  },
  'Language': {
    color: 'bg-green-100 border-green-200 text-green-800',
    icon: MessageCircle,
    bgClass: 'bg-green-50'
  },
  'Maths': {
    color: 'bg-orange-100 border-orange-200 text-orange-800',
    icon: Calculator,
    bgClass: 'bg-orange-50'
  },
  'Geography': {
    color: 'bg-teal-100 border-teal-200 text-teal-800',
    icon: MapPin,
    bgClass: 'bg-teal-50'
  },
  'Activities/Games': {
    color: 'bg-pink-100 border-pink-200 text-pink-800',
    icon: Gamepad2,
    bgClass: 'bg-pink-50'
  },
  'Books': {
    color: 'bg-indigo-100 border-indigo-200 text-indigo-800',
    icon: BookOpen,
    bgClass: 'bg-indigo-50'
  },
  'Toys': {
    color: 'bg-yellow-100 border-yellow-200 text-yellow-800',
    icon: Gift,
    bgClass: 'bg-yellow-50'
  },
  'Movies': {
    color: 'bg-gray-100 border-gray-200 text-gray-800',
    icon: Film,
    bgClass: 'bg-gray-50'
  },
  'Rhymes/Songs': {
    color: 'bg-rose-100 border-rose-200 text-rose-800',
    icon: Music,
    bgClass: 'bg-rose-50'
  },
  'Screen Time (+Suggested Content)': {
    color: 'bg-cyan-100 border-cyan-200 text-cyan-800',
    icon: Tv,
    bgClass: 'bg-cyan-50'
  }
};

export default function ActivityCard({ description, category, image }: ActivityCardProps) {
  // Type-safe category lookup with fallback
  const config = (categoryConfig as Record<string, CategoryConfig>)[category] || categoryConfig['Activities/Games'];
  const IconComponent = config.icon;
  
  return (
    <Card className={`${config.bgClass} border-0 ${config.color.split(' ')[1]} hover:shadow-md transition-shadow duration-200`}>
      {image && (
        <div className="pb-0">
          <Image
            src={image}
            alt={`${category} illustration`}
            width={360}
            height={240}
            className="w-full h-auto object-cover rounded-t-lg"
            onError={(e) => {
              // Hide image if it fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${config.color}`}>
            <IconComponent size={20} />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2 text-gray-800">
              {category}
            </CardTitle>
            <p className="text-sm text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}