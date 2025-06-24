// src/app/api/children/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { child, userChildRelation } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getErrorMessage } from '@/lib/utils';

// GET - List all children for user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get children with relationship info
    const childrenData = await db
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
      .where(eq(userChildRelation.userId, session.user.id));

    return NextResponse.json({ children: childrenData });
  } catch (error) {
    console.error('Get children error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch children' },
      { status: 500 }
    );
  }
}

// POST - Create new child
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
      name, 
      dateOfBirth, 
      gender, 
      headCircumference, 
      height, 
      weight, 
      relationship,
      isPrimary = false 
    } = body;

    // Validate required fields
    if (!name || !dateOfBirth || !gender || !relationship) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const childId = nanoid();
    const relationId = nanoid();

    // Create child
    await db.insert(child).values({
      id: childId,
      name: name.trim(),
      dateOfBirth: new Date(dateOfBirth),
      gender,
      headCircumference: headCircumference || null,
      height: height || null,
      weight: weight || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create relationship
    await db.insert(userChildRelation).values({
      id: relationId,
      userId: session.user.id,
      childId,
      relationship,
      isPrimary,
      createdAt: new Date(),
    });

    return NextResponse.json({ 
      success: true, 
      childId,
      message: 'Child added successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Create child error:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}