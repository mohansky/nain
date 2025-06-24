// app/api/activities/route.ts 
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { activity, child, userChildRelation } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/utils';
import { nanoid } from 'nanoid';

// GET - Get all activities for user's children
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all activities for children that belong to this user
    const activities = await db
      .select({
        id: activity.id,
        childId: activity.childId,
        title: activity.title,
        description: activity.description,
        duration: activity.duration,
        category: activity.category,
        recordedAt: activity.recordedAt,
        image: activity.image,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
        // Include child name for reference
        childName: child.name,
      })
      .from(activity)
      .innerJoin(child, eq(activity.childId, child.id))
      .innerJoin(userChildRelation, eq(child.id, userChildRelation.childId))
      .where(eq(userChildRelation.userId, session.user.id))
      .orderBy(desc(activity.recordedAt));

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Get activities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST - Create new activity
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      childId,
      title, 
      description, 
      duration, 
      category,
      recordedAt,
      image
    } = body;

    // Validate required fields
    if (!childId || !title || !category || !recordedAt) {
      return NextResponse.json(
        { error: 'Missing required fields: childId, title, category, recordedAt' },
        { status: 400 }
      );
    }

    // Verify user has access to this child
    const childRelation = await db
      .select()
      .from(userChildRelation)
      .where(
        and(
          eq(userChildRelation.childId, childId),
          eq(userChildRelation.userId, session.user.id)
        )
      )
      .limit(1);

    if (!childRelation.length) {
      return NextResponse.json(
        { error: 'Child not found or access denied' },
        { status: 404 }
      );
    }

    // Create activity
    const activityId = nanoid();
    const now = new Date();

    const newActivity = {
      id: activityId,
      childId,
      title: title.trim(),
      description: description?.trim() || null,
      duration: duration || null,
      category,
      recordedAt: new Date(recordedAt),
      image: image || null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(activity).values(newActivity);

    return NextResponse.json({ 
      activity: newActivity,
      message: 'Activity created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create activity error:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
