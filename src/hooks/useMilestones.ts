'use client';

// src/hooks/useMilestones.ts
import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/utils';

// Types
interface Milestone {
  id: string;
  childId: string;
  title: string;
  description?: string;
  achievedAt: Date;
  photos: string[]; // Array of photo URLs
  createdAt: Date;
  updatedAt: Date;
  // Additional fields from API joins
  childName?: string;
  childProfileImage?: string;
}

interface CreateMilestoneRequest {
  childId: string;
  title: string;
  description?: string;
  achievedAt: Date | string;
  photos?: string[];
}

interface UpdateMilestoneRequest {
  title?: string;
  description?: string;
  achievedAt?: Date | string;
  photos?: string[];
}

interface UseMilestonesReturn {
  milestones: Milestone[];
  isLoading: boolean;
  error: string | null;
  addMilestone: (milestoneData: CreateMilestoneRequest) => Promise<boolean>;
  updateMilestone: (id: string, milestoneData: UpdateMilestoneRequest) => Promise<boolean>;
  deleteMilestone: (id: string) => Promise<boolean>;
  refetch: () => void;
  getMilestonesByChild: (childId: string) => Milestone[];
  getMilestonesByDateRange: (startDate: Date, endDate: Date) => Milestone[];
  getRecentMilestones: (limit?: number) => Milestone[];
}

export function useMilestones(): UseMilestonesReturn {
  const { data: session } = useSession();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMilestones = async () => {
    if (!session?.user) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/milestones');
      
      if (!response.ok) {
        throw new Error('Failed to fetch milestones');
      }

      const data = await response.json();
      
      // Convert date strings to Date objects and parse photos JSON
      const processedMilestones = (data.milestones || []).map((milestone: Milestone) => ({
        ...milestone,
        achievedAt: new Date(milestone.achievedAt),
        createdAt: new Date(milestone.createdAt),
        updatedAt: new Date(milestone.updatedAt),
        photos: milestone.photos ? 
          (typeof milestone.photos === 'string' ? JSON.parse(milestone.photos) : milestone.photos) 
          : [],
      }));

      setMilestones(processedMilestones);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const addMilestone = async (milestoneData: CreateMilestoneRequest): Promise<boolean> => {
    try {
      setError(null);
      
      // Prepare data for API
      const requestData = {
        ...milestoneData,
        achievedAt: milestoneData.achievedAt instanceof Date 
          ? milestoneData.achievedAt.toISOString() 
          : milestoneData.achievedAt,
        photos: milestoneData.photos || [],
      };

      const response = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add milestone');
      }

      await fetchMilestones(); // Refresh the list
      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      return false;
    }
  };

  const updateMilestone = async (id: string, milestoneData: UpdateMilestoneRequest): Promise<boolean> => {
    try {
      setError(null);
      
      // Prepare data for API
      const requestData = {
        ...milestoneData,
        achievedAt: milestoneData.achievedAt instanceof Date 
          ? milestoneData.achievedAt.toISOString() 
          : milestoneData.achievedAt,
        photos: milestoneData.photos || [],
      };

      const response = await fetch(`/api/milestones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update milestone');
      }

      await fetchMilestones(); // Refresh the list
      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      return false;
    }
  };

  const deleteMilestone = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/milestones/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete milestone');
      }

      await fetchMilestones(); // Refresh the list
      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      return false;
    }
  };

  // Helper functions for filtering milestones
  const getMilestonesByChild = (childId: string): Milestone[] => {
    return milestones.filter(milestone => milestone.childId === childId);
  };

  const getMilestonesByDateRange = (startDate: Date, endDate: Date): Milestone[] => {
    return milestones.filter(milestone => {
      const milestoneDate = new Date(milestone.achievedAt);
      return milestoneDate >= startDate && milestoneDate <= endDate;
    });
  };

  const getRecentMilestones = (limit: number = 5): Milestone[] => {
    return milestones
      .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())
      .slice(0, limit);
  };

  // Fetch milestones when user session is available
  useEffect(() => {
    if (session?.user) {
      fetchMilestones();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user]);

  const refetch = () => {
    fetchMilestones();
  };

  return {
    milestones,
    isLoading,
    error,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    refetch,
    getMilestonesByChild,
    getMilestonesByDateRange,
    getRecentMilestones,
  };
}

// Optional: Create a hook for a specific child's milestones
export function useChildMilestones(childId: string) {
  const { 
    milestones, 
    isLoading, 
    error, 
    addMilestone, 
    updateMilestone, 
    deleteMilestone, 
    refetch 
  } = useMilestones();

  const childMilestones = milestones.filter(milestone => milestone.childId === childId);

  const addChildMilestone = async (milestoneData: Omit<CreateMilestoneRequest, 'childId'>) => {
    return addMilestone({ ...milestoneData, childId });
  };

  return {
    milestones: childMilestones,
    isLoading,
    error,
    addMilestone: addChildMilestone,
    updateMilestone,
    deleteMilestone,
    refetch,
  };
}