export interface UserProfile {
  $id?: string;
  userId: string; // Firebase UID
  email: string;
  name?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
}

// Helper function to check if role has admin privileges
export function hasAdminPrivileges(role: UserRole): boolean {
  return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
}

// Helper function to check if role is super admin
export function isSuperAdmin(role: UserRole): boolean {
  return role === UserRole.SUPER_ADMIN;
}
