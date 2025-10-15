"use server";

import { db } from "../firebase/server";
import admin from "../firebase/server";
import { UserProfile, UserRole } from "../domains/user_profile.domain";

// Collection information
const USER_PROFILES_COLLECTION = "userProfiles";

// Helper function to serialize Firestore data for client components
function serializeUserProfile(
  data: FirebaseFirestore.DocumentData
): UserProfile {
  return {
    ...data,
    createdAt: data.createdAt?.toDate
      ? data.createdAt.toDate()
      : new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate
      ? data.updatedAt.toDate()
      : new Date(data.updatedAt),
  } as UserProfile;
}

// Create a new user profile
export async function createUserProfile(
  userProfile: Omit<UserProfile, "$id" | "createdAt" | "updatedAt">
) {
  try {
    const docRef = await db.collection(USER_PROFILES_COLLECTION).add({
      userId: userProfile.userId,
      email: userProfile.email,
      name: userProfile.name,
      role: userProfile.role,
      isActive: userProfile.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const doc = await docRef.get();
    const data = doc.data();

    return {
      success: true,
      data: {
        $id: doc.id,
        ...serializeUserProfile(data!),
      },
    };
  } catch (error) {
    console.error("Error creating user profile:", error);
    return {
      success: false,
      error: "Failed to create user profile",
    };
  }
}

// Get a user profile by Firebase UID
export async function getUserProfileByUserId(userId: string) {
  try {
    const snapshot = await db
      .collection(USER_PROFILES_COLLECTION)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return {
        success: false,
        error: "User profile not found",
      };
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      success: true,
      data: {
        $id: doc.id,
        ...serializeUserProfile(data),
      },
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      success: false,
      error: "Failed to fetch user profile",
    };
  }
}

// Get a user profile by email
export async function getUserProfileByEmail(email: string) {
  try {
    const snapshot = await db
      .collection(USER_PROFILES_COLLECTION)
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return {
        success: false,
        error: "User profile not found",
      };
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      success: true,
      data: {
        $id: doc.id,
        ...serializeUserProfile(data),
      },
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      success: false,
      error: "Failed to fetch user profile",
    };
  }
}

// Get all user profiles
export async function getAllUserProfiles() {
  try {
    const snapshot = await db
      .collection(USER_PROFILES_COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(1000)
      .get();

    const documents = snapshot.docs.map((doc) => ({
      $id: doc.id,
      ...serializeUserProfile(doc.data()),
    }));

    return {
      success: true,
      data: documents,
    };
  } catch (error) {
    console.error("Error fetching all user profiles:", error);
    return {
      success: false,
      error: "Failed to fetch user profiles",
    };
  }
}

// Update a user profile
export async function updateUserProfile(
  profileId: string,
  updateData: Partial<Omit<UserProfile, "$id" | "userId" | "createdAt">>
) {
  try {
    const docRef = db.collection(USER_PROFILES_COLLECTION).doc(profileId);

    await docRef.update({
      ...updateData,
      updatedAt: new Date(),
    });

    const doc = await docRef.get();
    const data = doc.data();

    return {
      success: true,
      data: {
        $id: doc.id,
        ...serializeUserProfile(data!),
      },
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      error: "Failed to update user profile",
    };
  }
}

// Update user role
export async function updateUserRole(profileId: string, role: UserRole) {
  return updateUserProfile(profileId, { role });
}

// Activate/Deactivate user
export async function updateUserStatus(profileId: string, isActive: boolean) {
  return updateUserProfile(profileId, { isActive });
}

// Delete a user profile
export async function deleteUserProfile(profileId: string) {
  try {
    await db.collection(USER_PROFILES_COLLECTION).doc(profileId).delete();

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting user profile:", error);
    return {
      success: false,
      error: "Failed to delete user profile",
    };
  }
}

// Check if user has admin privileges
export async function checkUserAdminPrivileges(userId: string) {
  try {
    // First, ensure default admin exists
    await ensureDefaultAdminExists();

    const result = await getUserProfileByUserId(userId);

    if (!result.success || !result.data) {
      return {
        success: false,
        hasAdminPrivileges: false,
        error: "User profile not found",
      };
    }

    const userProfile = result.data as UserProfile;
    const hasAdminPrivileges =
      userProfile.isActive &&
      (userProfile.role === UserRole.SUPER_ADMIN ||
        userProfile.role === UserRole.ADMIN);

    return {
      success: true,
      hasAdminPrivileges,
      userProfile,
    };
  } catch (error) {
    console.error("Error checking user admin privileges:", error);
    return {
      success: false,
      hasAdminPrivileges: false,
      error: "Failed to check user privileges",
    };
  }
}

// Check if user profiles collection is empty
export async function isUserProfilesEmpty(): Promise<boolean> {
  try {
    const snapshot = await db
      .collection(USER_PROFILES_COLLECTION)
      .limit(1)
      .get();

    return snapshot.empty;
  } catch (error) {
    console.error(
      "Error checking if user profiles collection is empty:",
      error
    );
    return false;
  }
}

// Create default super admin profile when collection is empty
export async function createDefaultSuperAdmin() {
  try {
    const defaultAdmin = {
      userId: "", // Empty userId for default admin
      email: "default@admin.com",
      name: "Default Super Admin",
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    };

    const result = await createUserProfile(defaultAdmin);

    if (result.success) {
      return {
        success: true,
        data: result.data,
        message: "Default super admin profile created",
      };
    } else {
      return {
        success: false,
        error: "Failed to create default super admin profile",
      };
    }
  } catch (error) {
    console.error("Error creating default super admin:", error);
    return {
      success: false,
      error: "Failed to create default super admin profile",
    };
  }
}

// Ensure at least one admin profile exists
export async function ensureDefaultAdminExists() {
  try {
    const isEmpty = await isUserProfilesEmpty();

    if (isEmpty) {
      await createDefaultSuperAdmin();
    }
  } catch (error) {
    console.error("Error ensuring default admin exists:", error);
  }
}

// Get default admin profile (empty userId)
export async function getDefaultAdminProfile() {
  try {
    const snapshot = await db
      .collection(USER_PROFILES_COLLECTION)
      .where("userId", "==", "")
      .where("role", "==", UserRole.SUPER_ADMIN)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return {
        success: false,
        error: "Default admin profile not found",
      };
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      success: true,
      data: {
        $id: doc.id,
        ...serializeUserProfile(data!),
      } as UserProfile,
    };
  } catch (error) {
    console.error("Error fetching default admin profile:", error);
    return {
      success: false,
      error: "Failed to fetch default admin profile",
    };
  }
}

// Update user password using Firebase Admin
export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    await admin.auth().updateUser(userId, {
      password: newPassword,
    });

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    console.error("Error updating user password:", error);
    return {
      success: false,
      error: "Failed to update password",
    };
  }
}
