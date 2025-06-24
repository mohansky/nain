// app/actions/activity-actions.ts
"use server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { activity, child, userChildRelation } from "@/lib/schema";
import { activityFormSchema } from "@/lib/validations/activity-validation";
import { ActivityFormState } from "@/types";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
 
function validateDuration(duration: string): {
  isValid: boolean;
  error?: string;
} {
  if (!duration || duration.trim() === "") {
    return { isValid: true }; // Optional field
  }

  const num = Number(duration);
  if (isNaN(num) || num <= 0 || num > 1440) {
    return {
      isValid: false,
      error: "Duration must be between 1 and 1440 minutes (24 hours)",
    };
  }

  return { isValid: true };
}

function validateDate(dateString: string): {
  isValid: boolean;
  error?: string;
} {
  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return { isValid: false, error: "Please enter a valid date and time" };
    }

    // Check if date is in the future (with 1 minute buffer)
    const now = new Date();
    const futureBuffer = new Date(now.getTime() + 60000);
    if (date > futureBuffer) {
      return { isValid: false, error: "Date cannot be in the future" };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: "Please enter a valid date and time" };
  }
}

export async function createActivity(
  prevState: ActivityFormState,
  formData: FormData
): Promise<ActivityFormState> {
  try {
    // Await headers() before using it
    const headersList = await headers();

    // Get the authenticated session using Better Auth
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Not authenticated",
        errors: {
          _form: ["You must be logged in to create activities"],
        },
      };
    }

    // Extract form data with proper handling
    const formValues = {
      title: (formData.get("title") as string) || "",
      description: (formData.get("description") as string) || "",
      duration: (formData.get("duration") as string) || "",
      category: (formData.get("category") as string) || "play",
      recordedAt: (formData.get("recordedAt") as string) || "",
      childId: (formData.get("childId") as string) || "",
      image: (formData.get("image") as string) || "",
    };

    // Basic validation with Zod
    const validation = activityFormSchema.safeParse(formValues);

    if (!validation.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const validatedData = validation.data;
    const errors: {
      title?: string[];
      description?: string[];
      duration?: string[];
      category?: string[];
      recordedAt?: string[];
      childId?: string[];
      image?: string[];
      _form?: string[];
    } = {};

    // Additional server-side validations
    const durationValidation = validateDuration(validatedData.duration || "");
    if (!durationValidation.isValid) {
      errors.duration = [durationValidation.error || "Invalid duration"];
    }

    const dateValidation = validateDate(validatedData.recordedAt);
    if (!dateValidation.isValid) {
      errors.recordedAt = [dateValidation.error || "Invalid date"];
    }

    // Return validation errors if any
    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Validation failed",
        errors,
      };
    }

    // Verify user has access to this child
    const childRelation = await db
      .select()
      .from(userChildRelation)
      .where(
        and(
          eq(userChildRelation.childId, validatedData.childId),
          eq(userChildRelation.userId, session.user.id)
        )
      )
      .limit(1);

    if (!childRelation.length) {
      return {
        success: false,
        message: "Access denied",
        errors: {
          childId: ["Child not found or access denied"],
        },
      };
    }

    // Create activity
    const activityId = nanoid();
    const now = new Date();

    const newActivity = {
      id: activityId,
      childId: validatedData.childId,
      title: validatedData.title.trim(),
      description: validatedData.description?.trim() || null,
      duration: validatedData.duration ? Number(validatedData.duration) : null,
      category: validatedData.category,
      recordedAt: new Date(validatedData.recordedAt),
      image: validatedData.image || null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(activity).values(newActivity);

    // Revalidate the activities page
    revalidatePath("/dashboard/activity");

    return {
      success: true,
      message: "Activity created successfully",
      data: newActivity,
    };
  } catch (error) {
    console.error("Create activity error:", error);
    return {
      success: false,
      message: "Failed to create activity",
      errors: {
        _form: ["An unexpected error occurred. Please try again."],
      },
    };
  }
}

export async function updateActivity(
  activityId: string,
  prevState: ActivityFormState,
  formData: FormData
): Promise<ActivityFormState> {
  try {
    // Await headers() before using it
    const headersList = await headers();

    // Get the authenticated session using Better Auth
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Not authenticated",
        errors: {
          _form: ["You must be logged in to update activities"],
        },
      };
    }

    // Extract form data with proper handling
    const formValues = {
      title: (formData.get("title") as string) || "",
      description: (formData.get("description") as string) || "",
      duration: (formData.get("duration") as string) || "",
      category: (formData.get("category") as string) || "play",
      recordedAt: (formData.get("recordedAt") as string) || "",
      childId: (formData.get("childId") as string) || "",
      image: (formData.get("image") as string) || "",
    };

    // Basic validation with Zod
    const validation = activityFormSchema.safeParse(formValues);

    if (!validation.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const validatedData = validation.data;
    const errors: {
      title?: string[];
      description?: string[];
      duration?: string[];
      category?: string[];
      recordedAt?: string[];
      childId?: string[];
      image?: string[];
      _form?: string[];
    } = {};

    // Additional server-side validations
    const durationValidation = validateDuration(validatedData.duration || "");
    if (!durationValidation.isValid) {
      errors.duration = [durationValidation.error || "Invalid duration"];
    }

    const dateValidation = validateDate(validatedData.recordedAt);
    if (!dateValidation.isValid) {
      errors.recordedAt = [dateValidation.error || "Invalid date"];
    }

    // Return validation errors if any
    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Validation failed",
        errors,
      };
    }

    // Verify user has access to this activity
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
      return {
        success: false,
        message: "Access denied",
        errors: {
          _form: ["Activity not found or access denied"],
        },
      };
    }

    // Update activity
    const updatedActivity = {
      title: validatedData.title.trim(),
      description: validatedData.description?.trim() || null,
      duration: validatedData.duration ? Number(validatedData.duration) : null,
      category: validatedData.category,
      recordedAt: new Date(validatedData.recordedAt),
      image: validatedData.image || null,
      updatedAt: new Date(),
    };

    await db
      .update(activity)
      .set(updatedActivity)
      .where(eq(activity.id, activityId));

    // Revalidate the activities page
    revalidatePath("/dashboard/activity");

    return {
      success: true,
      message: "Activity updated successfully",
      data: { id: activityId, ...updatedActivity },
    };
  } catch (error) {
    console.error("Update activity error:", error);
    return {
      success: false,
      message: "Failed to update activity",
      errors: {
        _form: ["An unexpected error occurred. Please try again."],
      },
    };
  }
}