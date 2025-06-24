// src/app/api/onboarding/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userProfile, child, userChildRelation } from '@/lib/schema';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { profile, children } = data;

    // Check if user profile already exists
    const existingProfile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, session.user.id))
      .limit(1);

    if (existingProfile.length > 0) {
      // Update existing profile
      await db
        .update(userProfile)
        .set({
          phone: profile.phone || null,
          language: profile.language,
          onboardingCompleted: true,
          updatedAt: new Date(),
        })
        .where(eq(userProfile.userId, session.user.id));
    } else {
      // Create new user profile
      await db.insert(userProfile).values({
        id: nanoid(),
        userId: session.user.id,
        phone: profile.phone || null,
        language: profile.language,
        onboardingCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Create children and relationships
    for (const childData of children) {
      const childId = nanoid();
      
      // Create child
      await db.insert(child).values({
        id: childId,
        name: childData.name,
        dateOfBirth: new Date(childData.dateOfBirth),
        gender: childData.gender,
        headCircumference: childData.headCircumference || null,
        height: childData.height || null,
        weight: childData.weight || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create relationship
      await db.insert(userChildRelation).values({
        id: nanoid(),
        userId: session.user.id,
        childId: childId,
        relationship: childData.relationship,
        isPrimary: true,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding completion error:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}