"use server";
// src/app/actions/user-profile.ts
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth"; // Your Better Auth instance
import { db } from "@/lib/db"; // Your Drizzle database instance
import { user, userProfile } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { isValidPhone } from "@/lib/utils";
import type { Language } from "@/types";
import * as z from "zod";

// Server-side validation schema
const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  language: z.enum([
    "English",
    "Hindi",
    "Assamese",
    "Bengali",
    "Kannada",
    "Tamil",
    "Marathi",
  ]),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

// Type definitions for update operations
interface UserUpdateData {
  name: string;
  updatedAt: Date;
  image?: string;
}

interface AuthUpdateData {
  name: string;
  image?: string;
}

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function updateUserProfile(formData: FormData): Promise<ActionResult> {
  try {
    // Await headers() before using it
    const headersList = await headers();
   
    // Get the authenticated session using Better Auth
    const session = await auth.api.getSession({
      headers: headersList
    });
   
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Not authenticated"
      };
    }

    // Extract and validate form data
    const rawData = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      language: formData.get("language") as Language,
      avatarUrl: formData.get("avatarUrl") as string || undefined,
    };

    // Server-side validation
    const validationResult = updateProfileSchema.safeParse(rawData);
   
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0]?.message || "Invalid form data"
      };
    }

    const data = validationResult.data;

    // Additional phone validation if provided
    if (data.phone && data.phone.trim() && !isValidPhone(data.phone)) {
      return {
        success: false,
        error: "Please enter a valid phone number"
      };
    }

    // Prepare user update data
    const userUpdateData: UserUpdateData = {
      name: data.name.trim(),
      updatedAt: new Date()
    };

    // Add avatar to user update if provided
    if (data.avatarUrl) {
      userUpdateData.image = data.avatarUrl;
    }

    // Update user name and avatar in the main user table
    await db.update(user)
      .set(userUpdateData)
      .where(eq(user.id, session.user.id));

    // Update Better Auth session with the new user data
    const authUpdateData: AuthUpdateData = {
      name: data.name.trim()
    };

    // Add avatar to auth update if provided
    if (data.avatarUrl) {
      authUpdateData.image = data.avatarUrl;
    }

    await auth.api.updateUser({
      headers: headersList,
      body: authUpdateData
    });

    // Check if user profile exists
    const existingProfile = await db.select()
      .from(userProfile)
      .where(eq(userProfile.userId, session.user.id))
      .limit(1);

    // Prepare profile update data
    const profileUpdateData = {
      phone: data.phone?.trim() || null,
      language: data.language,
      updatedAt: new Date(),
      ...(data.avatarUrl && { avatar: data.avatarUrl }),
    };

    if (existingProfile.length > 0) {
      // Update existing profile
      await db.update(userProfile)
        .set(profileUpdateData)
        .where(eq(userProfile.userId, session.user.id));
    } else {
      // Create new profile
      await db.insert(userProfile)
        .values({
          id: crypto.randomUUID(), // Generate unique ID
          userId: session.user.id,
          phone: data.phone?.trim() || null,
          language: data.language,
          avatar: data.avatarUrl || null,
          onboardingCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
    }

    // Revalidate relevant paths to update cached data
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    revalidatePath("/dashboard/settings"); // Temporary fix for broken routing

    return {
      success: true
    };

  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      error: "An unexpected error occurred"
    };
  }
}