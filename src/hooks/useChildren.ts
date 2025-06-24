'use client';
// src/hooks/useChildren.ts
import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { getErrorMessage } from '@/lib/utils';
import type { ChildWithRelation, CreateChildRequest, UpdateChildRequest } from '@/types';

interface UseChildrenReturn {
  children: ChildWithRelation[];
  isLoading: boolean;
  error: string | null;
  addChild: (childData: CreateChildRequest) => Promise<boolean>;
  updateChild: (id: string, childData: UpdateChildRequest) => Promise<boolean>;
  deleteChild: (id: string) => Promise<boolean>;
  refetch: () => void;
}

export function useChildren(): UseChildrenReturn {
  const { data: session } = useSession();
  const [children, setChildren] = useState<ChildWithRelation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChildren = async () => {
    if (!session?.user) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/children');
      
      if (!response.ok) {
        throw new Error('Failed to fetch children');
      }

      const data = await response.json();
      setChildren(data.children || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const addChild = async (childData: CreateChildRequest): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(childData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add child');
      }

      await fetchChildren(); // Refresh the list
      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      return false;
    }
  };

  const updateChild = async (id: string, childData: UpdateChildRequest): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/children/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(childData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update child');
      }

      await fetchChildren(); // Refresh the list
      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      return false;
    }
  };

  const deleteChild = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/children/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete child');
      }

      await fetchChildren(); // Refresh the list
      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      return false;
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchChildren();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user]);

  const refetch = () => {
    fetchChildren();
  };

  return {
    children,
    isLoading,
    error,
    addChild,
    updateChild,
    deleteChild,
    refetch,
  };
}