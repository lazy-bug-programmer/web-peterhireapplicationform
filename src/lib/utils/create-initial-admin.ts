/**
 * Utility script to create initial admin users
 *
 * Usage example:
 * 1. Create a Firebase user through Firebase Console or Auth API
 * 2. Use createUserProfile action to create corresponding user profile
 * 3. Set role to SUPER_ADMIN or ADMIN
 */

import { UserRole } from "@/lib/domains/user_profile.domain";

export const createInitialAdmin = {
  // Sample data for creating an admin user profile
  superAdmin: {
    userId: "FIREBASE_UID_HERE", // Replace with actual Firebase UID
    email: "admin@example.com",
    name: "Super Administrator",
    role: UserRole.SUPER_ADMIN,
    isActive: true,
  },

  admin: {
    userId: "FIREBASE_UID_HERE", // Replace with actual Firebase UID
    email: "admin@company.com",
    name: "Administrator",
    role: UserRole.ADMIN,
    isActive: true,
  },
};

/**
 * Instructions to create initial admin:
 *
 * 1. Create Firebase user:
 *    - Go to Firebase Console > Authentication > Users
 *    - Click "Add user" and create with email/password
 *    - Copy the generated UID
 *
 * 2. Create user profile:
 *    - Use the createUserProfile action from user_profile.action.ts
 *    - Pass the Firebase UID and admin data
 *
 * 3. Test login:
 *    - User can now login with admin privileges
 */
