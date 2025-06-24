// src/pages/api/children/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { child, userChildRelation } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/utils'; 
import { ChildUpdateData, RelationUpdateData } from '@/types';



// GET - Get specific child
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

    const childData = await db
      .select({
        // Child data
        id: child.id,
        name: child.name,
        dateOfBirth: child.dateOfBirth,
        gender: child.gender,
        headCircumference: child.headCircumference,
        height: child.height,
        weight: child.weight,
        profileImage: child.profileImage,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
        // Relation data
        relationId: userChildRelation.id,
        relationship: userChildRelation.relationship,
        isPrimary: userChildRelation.isPrimary,
        relationCreatedAt: userChildRelation.createdAt,
      })
      .from(child)
      .innerJoin(userChildRelation, eq(child.id, userChildRelation.childId))
      .where(
        and(
          eq(child.id, id),
          eq(userChildRelation.userId, session.user.id)
        )
      )
      .limit(1);

    if (!childData.length) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    return NextResponse.json({ child: childData[0] });
  } catch (error) {
    console.error('Get child error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch child' },
      { status: 500 }
    );
  }
}

// PUT - Update child
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

    // Verify user has access to this child
    const existingRelation = await db
      .select()
      .from(userChildRelation)
      .where(
        and(
          eq(userChildRelation.childId, id),
          eq(userChildRelation.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existingRelation.length) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      name, 
      dateOfBirth, 
      gender, 
      headCircumference, 
      height, 
      weight, 
      relationship,
      isPrimary,
      profileImage
    } = body;

    // Update child data
    const childUpdateData: ChildUpdateData = { updatedAt: new Date() };
    if (name !== undefined) childUpdateData.name = name.trim();
    if (dateOfBirth !== undefined) childUpdateData.dateOfBirth = new Date(dateOfBirth);
    if (gender !== undefined) childUpdateData.gender = gender;
    if (headCircumference !== undefined) childUpdateData.headCircumference = headCircumference || null;
    if (height !== undefined) childUpdateData.height = height || null;
    if (weight !== undefined) childUpdateData.weight = weight || null;
    if (profileImage !== undefined) childUpdateData.profileImage = profileImage || null;

    await db
      .update(child)
      .set(childUpdateData)
      .where(eq(child.id, id));

    // Update relationship if provided
    const relationUpdateData: RelationUpdateData = {};
    if (relationship !== undefined) relationUpdateData.relationship = relationship;
    if (isPrimary !== undefined) relationUpdateData.isPrimary = isPrimary;

    if (Object.keys(relationUpdateData).length > 0) {
      await db
        .update(userChildRelation)
        .set(relationUpdateData)
        .where(eq(userChildRelation.id, existingRelation[0].id));
    }

    return NextResponse.json({ 
      success: true,
      message: 'Child updated successfully'
    });
  } catch (error) {
    console.error('Update child error:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// DELETE - Delete child
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

    // Verify user has access to this child
    const existingRelation = await db
      .select()
      .from(userChildRelation)
      .where(
        and(
          eq(userChildRelation.childId, id),
          eq(userChildRelation.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existingRelation.length) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Delete relationship first (due to foreign key constraints)
    await db
      .delete(userChildRelation)
      .where(eq(userChildRelation.id, existingRelation[0].id));

    // Check if child has other relationships
    const otherRelations = await db
      .select()
      .from(userChildRelation)
      .where(eq(userChildRelation.childId, id));

    // If no other relationships, delete the child
    if (otherRelations.length === 0) {
      await db
        .delete(child)
        .where(eq(child.id, id));
    }

    return NextResponse.json({ 
      success: true,
      message: 'Child removed successfully'
    });
  } catch (error) {
    console.error('Delete child error:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}