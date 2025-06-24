// app/api/milestones/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { milestone, child, userChildRelation } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/utils';
import { nanoid } from 'nanoid';

// GET - Get all milestones for user's children
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all milestones for children that belong to this user
    const milestones = await db
      .select({
        id: milestone.id,
        childId: milestone.childId,
        title: milestone.title,
        description: milestone.description,
        achievedAt: milestone.achievedAt,
        photos: milestone.photos,
        createdAt: milestone.createdAt,
        updatedAt: milestone.updatedAt,
        // Include child name for reference
        childName: child.name,
      })
      .from(milestone)
      .innerJoin(child, eq(milestone.childId, child.id))
      .innerJoin(userChildRelation, eq(child.id, userChildRelation.childId))
      .where(eq(userChildRelation.userId, session.user.id))
      .orderBy(desc(milestone.achievedAt));

    return NextResponse.json({ milestones });
  } catch (error) {
    console.error('Get milestones error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    );
  }
}

// POST - Create new milestone
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
      achievedAt,
      photos
    } = body;

    // Validate required fields
    if (!childId || !title || !achievedAt) {
      return NextResponse.json(
        { error: 'Missing required fields: childId, title, achievedAt' },
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

    // Create milestone
    const milestoneId = nanoid();
    const now = new Date();

    const newMilestone = {
      id: milestoneId,
      childId,
      title: title.trim(),
      description: description?.trim() || null,
      achievedAt: new Date(achievedAt),
      photos: photos ? JSON.stringify(photos) : null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(milestone).values(newMilestone);

    // Return milestone with parsed photos
    const responseData = {
      ...newMilestone,
      photos: photos || [],
    };

    return NextResponse.json({ 
      milestone: responseData,
      message: 'Milestone created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create milestone error:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}