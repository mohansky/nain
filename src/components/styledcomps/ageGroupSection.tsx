// src/components/styledcomps/ageGroupSection.tsx
import React from 'react';
// import { Baby } from 'lucide-react';  
import ActivityCard from './activityCard';

interface Milestone {
  category: string;
  description: string;
  image: string | null;
}

interface AgeGroupSectionProps {
  ageGroup: string;
  milestones: Milestone[];
}

export default function AgeGroupSection({ ageGroup, milestones }: AgeGroupSectionProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        {/* <div className="p-3 bg-indigo-100 rounded-full">
          <Baby className="text-info" size={24} />
        </div> */}
        <h2 className="text-2xl font-bold text-gray-800">{ageGroup}</h2>
      </div>
      
      <div className="grid grid-cols-1 max-w-md mx-auto gap-4">
        {milestones.map((milestone, index) => (
          <ActivityCard
            key={`${ageGroup}-${milestone.category}-${index}`}
            description={milestone.description}
            category={milestone.category}
            image={milestone.image}
          />
        ))}
      </div>
    </div>
  );
}