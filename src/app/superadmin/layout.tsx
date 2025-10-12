"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/domains/user_profile.domain";
import { Loader2 } from "lucide-react";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, isAdmin, user, userProfile } = useAuth();
  const router = useRouter();

  const isSuperAdmin =
    userProfile?.role === UserRole.SUPER_ADMIN && userProfile?.isActive;

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (user !== null && !isLoggedIn) {
      router.push("/login");
      return;
    }

    // If user is logged in but not admin, redirect to login
    if (user !== null && isLoggedIn && !isAdmin) {
      router.push("/login");
      return;
    }

    // If user is admin but not super admin, redirect to regular admin
    if (user !== null && isLoggedIn && isAdmin && !isSuperAdmin) {
      router.push("/admin");
      return;
    }
  }, [isLoggedIn, isAdmin, isSuperAdmin, user, router]);

  // Show loading while checking authentication
  if (user === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isLoggedIn || !isAdmin || !isSuperAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky px-4 top-0 z-10 border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between py-4">
          <AdminNav basePath="/superadmin" />
        </div>
      </header>
      <main className="flex-1 container mx-auto py-8 px-4">{children}</main>
    </div>
  );
}
