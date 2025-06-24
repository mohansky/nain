// app/api/milestones/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { milestone, child, userChildRelation } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/utils';

// Types for update operations
interface MilestoneUpdateData {
  updatedAt: Date;
  title?: string;
  description?: string | null;
  achievedAt?: Date;
  photos?: string | null;
}

// GET - Get specific milestone
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const milestoneData = await db
      .select({
        id: milestone.id,
        childId: milestone.childId,
        title: milestone.title,
        description: milestone.description,
        achievedAt: milestone.achievedAt,
        photos: milestone.photos,
        createdAt: milestone.createdAt,
        updatedAt: milestone.updatedAt,
        // Include child info
        childName: child.name,
        childProfileImage: child.profileImage,
      })
      .from(milestone)
      .innerJoin(child, eq(milestone.childId, child.id))
      .innerJoin(userChildRelation, eq(child.id, userChildRelation.childId))
      .where(
        and(
          eq(milestone.id, id),
          eq(userChildRelation.userId, session.user.id)
        )
      )
      .limit(1);

    if (!milestoneData.length) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // Parse photos JSON
    const result = {
      ...milestoneData[0],
      photos: milestoneData[0].photos ? JSON.parse(milestoneData[0].photos) : [],
    };

    return NextResponse.json({ milestone: result });
  } catch (error) {
    console.error('Get milestone error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestone' },
      { status: 500 }
    );
  }
}

// PUT - Update milestone
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify user has access to this milestone
    const existingMilestone = await db
      .select({
        milestoneId: milestone.id,
        childId: milestone.childId,
      })
      .from(milestone)
      .innerJoin(child, eq(milestone.childId, child.id))
      .innerJoin(userChildRelation, eq(child.id, userChildRelation.childId))
      .where(
        and(
          eq(milestone.id, id),
          eq(userChildRelation.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existingMilestone.length) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      achievedAt,
      photos
    } = body;

    // Update milestone data
    const milestoneUpdateData: MilestoneUpdateData = { updatedAt: new Date() };
    if (title !== undefined) milestoneUpdateData.title = title.trim();
    if (description !== undefined) milestoneUpdateData.description = description?.trim() || null;
    if (achievedAt !== undefined) milestoneUpdateData.achievedAt = new Date(achievedAt);
    if (photos !== undefined) milestoneUpdateData.photos = photos ? JSON.stringify(photos) : null;

    await db
      .update(milestone)
      .set(milestoneUpdateData)
      .where(eq(milestone.id, id));

    return NextResponse.json({ 
      success: true,
      message: 'Milestone updated successfully'
    });
  } catch (error) {
    console.error('Update milestone error:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// DELETE - Delete milestone
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify user has access to this milestone
    const existingMilestone = await db
      .select({
        milestoneId: milestone.id,
        photos: milestone.photos,
      })
      .from(milestone)
      .innerJoin(child, eq(milestone.childId, child.id))
      .innerJoin(userChildRelation, eq(child.id, userChildRelation.childId))
      .where(
        and(
          eq(milestone.id, id),
          eq(userChildRelation.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existingMilestone.length) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // TODO: Delete associated photos from R2 if exists
    // if (existingMilestone[0].photos) {
    //   const photoUrls = JSON.parse(existingMilestone[0].photos);
    //   const { deleteFromR2 } = await import('@/lib/r2-upload');
    //   await Promise.all(photoUrls.map((url: string) => deleteFromR2(url)));
    // }

    // Delete the milestone
    await db
      .delete(milestone)
      .where(eq(milestone.id, id));

    return NextResponse.json({ 
      success: true,
      message: 'Milestone deleted successfully'
    });
  } catch (error) {
    console.error('Delete milestone error:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}