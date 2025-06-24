// app/api/activities/[id]/route.ts - Delete endpoint for activities
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { activity, child, userChildRelation } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await the params since they're now a Promise
    const params = await context.params;
    const activityId = params.id;

    if (!activityId) {
      return NextResponse.json(
        { error: "Activity ID is required" },
        { status: 400 }
      );
    }

    const existingActivity = await db
      .select()
      .from(activity)
      .innerJoin(child, eq(activity.childId, child.id))
      .innerJoin(userChildRelation, eq(child.id, userChildRelation.childId))
      .where(
        and(
          eq(activity.id, activityId),
          eq(userChildRelation.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existingActivity.length) {
      return NextResponse.json(
        { error: "Activity not found or access denied" },
        { status: 404 }
      );
    }

    await db.delete(activity).where(eq(activity.id, activityId));

    return NextResponse.json({
      message: "Activity deleted successfully",
    });
  } catch (error) {
    console.error("Delete activity error:", error);
    return NextResponse.json(
      { error: "Failed to delete activity" },
      { status: 500 }
    );
  }
}


// // app/api/activities/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { auth } from '@/lib/auth';
// import { db } from '@/lib/db';
// import { activity, child, userChildRelation } from '@/lib/schema';
// import { eq, and } from 'drizzle-orm';
// import { getErrorMessage } from '@/lib/utils';

// // Types for update operations
// interface ActivityUpdateData {
//   updatedAt: Date;
//   title?: string;
//   description?: string | null;
//   duration?: number | null;
//   category?: string;
//   recordedAt?: Date;
//   image?: string | null;
// }

// // GET - Get specific activity
// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const session = await auth.api.getSession({
//       headers: request.headers,
//     });

//     if (!session?.user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { id } = await params;

//     const activityData = await db
//       .select({
//         id: activity.id,
//         childId: activity.childId,
//         title: activity.title,
//         description: activity.description,
//         duration: activity.duration,
//         category: activity.category,
//         recordedAt: activity.recordedAt,
//         image: activity.image,
//         createdAt: activity.createdAt,
//         updatedAt: activity.updatedAt,
//         // Include child info
//         childName: child.name,
//         childProfileImage: child.profileImage,
//       })
//       .from(activity)
//       .innerJoin(child, eq(activity.childId, child.id))
//       .innerJoin(userChildRelation, eq(child.id, userChildRelation.childId))
//       .where(
//         and(
//           eq(activity.id, id),
//           eq(userChildRelation.userId, session.user.id)
//         )
//       )
//       .limit(1);

//     if (!activityData.length) {
//       return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
//     }

//     return NextResponse.json({ activity: activityData[0] });
//   } catch (error) {
//     console.error('Get activity error:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch activity' },
//       { status: 500 }
//     );
//   }
// }

// // PUT - Update activity
// export async function PUT(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const session = await auth.api.getSession({
//       headers: request.headers,
//     });

//     if (!session?.user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { id } = await params;

//     // Verify user has access to this activity
//     const existingActivity = await db
//       .select({
//         activityId: activity.id,
//         childId: activity.childId,
//       })
//       .from(activity)
//       .innerJoin(child, eq(activity.childId, child.id))
//       .innerJoin(userChildRelation, eq(child.id, userChildRelation.childId))
//       .where(
//         and(
//           eq(activity.id, id),
//           eq(userChildRelation.userId, session.user.id)
//         )
//       )
//       .limit(1);

//     if (!existingActivity.length) {
//       return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
//     }

//     const body = await request.json();
//     const {
//       title,
//       description,
//       duration,
//       category,
//       recordedAt,
//       image
//     } = body;

//     // Update activity data
//     const activityUpdateData: ActivityUpdateData = { updatedAt: new Date() };
//     if (title !== undefined) activityUpdateData.title = title.trim();
//     if (description !== undefined) activityUpdateData.description = description?.trim() || null;
//     if (duration !== undefined) activityUpdateData.duration = duration || null;
//     if (category !== undefined) activityUpdateData.category = category;
//     if (recordedAt !== undefined) activityUpdateData.recordedAt = new Date(recordedAt);
//     if (image !== undefined) activityUpdateData.image = image || null;

//     await db
//       .update(activity)
//       .set(activityUpdateData)
//       .where(eq(activity.id, id));

//     return NextResponse.json({
//       success: true,
//       message: 'Activity updated successfully'
//     });
//   } catch (error) {
//     console.error('Update activity error:', error);
//     return NextResponse.json(
//       { error: getErrorMessage(error) },
//       { status: 500 }
//     );
//   }
// }

// // DELETE - Delete activity
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const session = await auth.api.getSession({
//       headers: request.headers,
//     });

//     if (!session?.user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { id } = await params;

//     // Verify user has access to this activity
//     const existingActivity = await db
//       .select({
//         activityId: activity.id,
//         image: activity.image,
//       })
//       .from(activity)
//       .innerJoin(child, eq(activity.childId, child.id))
//       .innerJoin(userChildRelation, eq(child.id, userChildRelation.childId))
//       .where(
//         and(
//           eq(activity.id, id),
//           eq(userChildRelation.userId, session.user.id)
//         )
//       )
//       .limit(1);

//     if (!existingActivity.length) {
//       return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
//     }

//     // TODO: Delete associated image from R2 if exists
//     // if (existingActivity[0].image) {
//     //   const { deleteFromR2 } = await import('@/lib/r2-upload');
//     //   await deleteFromR2(existingActivity[0].image);
//     // }

//     // Delete the activity
//     await db
//       .delete(activity)
//       .where(eq(activity.id, id));

//     return NextResponse.json({
//       success: true,
//       message: 'Activity deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete activity error:', error);
//     return NextResponse.json(
//       { error: getErrorMessage(error) },
//       { status: 500 }
//     );
//   }
// }

// // // app/api/children/route.ts (if you don't have this yet)
// // import { NextRequest, NextResponse } from 'next/server';
// // import { auth } from '@/lib/auth';
// // import { db } from '@/lib/db';
// // import { child, userChildRelation } from '@/lib/schema';
// // import { eq } from 'drizzle-orm';

// // // GET - Get all children for user
// // export async function GET(request: NextRequest) {
// //   try {
// //     const session = await auth.api.getSession({
// //       headers: request.headers,
// //     });

// //     if (!session?.user) {
// //       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// //     }

// //     const children = await db
// //       .select({
// //         id: child.id,
// //         name: child.name,
// //         dateOfBirth: child.dateOfBirth,
// //         gender: child.gender,
// //         profileImage: child.profileImage,
// //         // Relation data
// //         relationship: userChildRelation.relationship,
// //         isPrimary: userChildRelation.isPrimary,
// //       })
// //       .from(child)
// //       .innerJoin(userChildRelation, eq(child.id, userChildRelation.childId))
// //       .where(eq(userChildRelation.userId, session.user.id));

// //     return NextResponse.json({ children });
// //   } catch (error) {
// //     console.error('Get children error:', error);
// //     return NextResponse.json(
// //       { error: 'Failed to fetch children' },
// //       { status: 500 }
// //     );
// //   }
// // }
