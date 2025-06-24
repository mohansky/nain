// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user, userProfile } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/utils';

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data
    const userData = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    // Get user profile data
    const userProfileData = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, session.user.id))
      .limit(1);

    return NextResponse.json({
      user: userData[0] || null,
      userProfile: userProfileData[0] || null,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, language } = body;

    // Update user table (name)
    if (name) {
      await db
        .update(user)
        .set({ 
          name,
          updatedAt: new Date()
        })
        .where(eq(user.id, session.user.id));
    }

    // Update or create user profile
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
          phone,
          language,
          updatedAt: new Date()
        })
        .where(eq(userProfile.userId, session.user.id));
    } else {
      // Create new profile
      const { nanoid } = await import('nanoid');
      await db
        .insert(userProfile)
        .values({
          id: nanoid(),
          userId: session.user.id,
          phone,
          language,
          onboardingCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}