// hooks/useActivities.ts - Updated to work with server actions
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Activity } from '@/types';

interface UseActivitiesReturn {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  deleteActivity: (id: string) => Promise<boolean>;
  refreshActivities: () => Promise<void>;
}

export function useActivities(): UseActivitiesReturn {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/activities', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch activities');
      }

      const data = await response.json();
      
      // Convert date strings back to Date objects
      const activitiesWithDates = data.activities.map((activity: Activity) => ({
        ...activity,
        recordedAt: new Date(activity.recordedAt),
        createdAt: new Date(activity.createdAt),
        updatedAt: new Date(activity.updatedAt),
      }));
      
      setActivities(activitiesWithDates);
    } catch (err) {
      console.error('Fetch activities error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteActivity = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete activity');
      }

      // Remove from local state
      setActivities(prev => prev.filter(activity => activity.id !== id));
      return true;
    } catch (err) {
      console.error('Delete activity error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete activity');
      return false;
    }
  };

  const refreshActivities = useCallback(async () => {
    await fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    isLoading,
    error,
    deleteActivity,
    refreshActivities,
  };
}

// api/activities/[id]/route.ts - Delete endpoint for activities
// import { NextRequest, NextResponse } from 'next/server';
// import { auth } from '@/lib/auth';
// import { db } from '@/lib/db';
// import { activity, child, userChildRelation } from '@/lib/schema';
// import { eq, and } from 'drizzle-orm';

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await auth.api.getSession({
//       headers: request.headers,
//     });

//     if (!session?.user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const activityId = params.id;

//     if (!activityId) {
//       return NextResponse.json(
//         { error: 'Activity ID is required' },
//         { status: 400 }
//       );
//     }

//     // Verify user has access to this activity
//     const existingActivity = await db
//       .select()
//       .from(activity)
//       .innerJoin(child, eq(activity.childId, child.id))
//       .innerJoin(userChildRelation, eq(child.id, userChildRelation.childId))
//       .where(
//         and(
//           eq(activity.id, activityId),
//           eq(userChildRelation.userId, session.user.id)
//         )
//       )
//       .limit(1);

//     if (!existingActivity.length) {
//       return NextResponse.json(
//         { error: 'Activity not found or access denied' },
//         { status: 404 }
//       );
//     }

//     // Delete the activity
//     await db.delete(activity).where(eq(activity.id, activityId));

//     return NextResponse.json({
//       message: 'Activity deleted successfully'
//     });

//   } catch (error) {
//     console.error('Delete activity error:', error);
//     return NextResponse.json(
//       { error: 'Failed to delete activity' },
//       { status: 500 }
//     );
//   }
// }