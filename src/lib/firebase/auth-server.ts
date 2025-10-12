import admin from "./server";
import { cookies } from "next/headers";
import { getUserProfileByUserId } from "../actions/user_profile.action";
import { UserProfile } from "../domains/user_profile.domain";

export interface User {
  $id: string;
  name?: string;
  email: string;
  userProfile?: UserProfile;
}

// Get logged in user from session
export async function getLoggedInUser(): Promise<User> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      throw new Error("No user session found");
    }

    // Get user from Firebase Auth
    const userRecord = await admin.auth().getUser(userId);

    // Get user profile from Firestore
    const profileResult = await getUserProfileByUserId(userId);
    const userProfile = profileResult.success
      ? (profileResult.data as UserProfile)
      : undefined;

    return {
      $id: userRecord.uid,
      name: userRecord.displayName || userProfile?.name || undefined,
      email: userRecord.email || "",
      userProfile,
    };
  } catch (error) {
    console.error("Error getting logged in user:", error);
    throw new Error("Not authenticated");
  }
}
