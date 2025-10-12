"use client";

import Link from "next/link";
import {
  FileText,
  Home,
  KeyRound,
  LogOut,
  Menu,
  Users,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AdminNavProps {
  basePath?: string;
}

export function AdminNav({ basePath = "/admin" }: AdminNavProps) {
  const { logout, isAdmin } = useAuth();

  return (
    <>
      <div className="flex items-center gap-6 md:gap-10">
        <Link
          href={basePath}
          className="font-bold text-xl text-purple-600 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          {basePath === "/superadmin" ? "Super Admin Portal" : "Admin Portal"}
        </Link>
        <nav className="hidden gap-6 md:flex">
          <Link
            href={basePath}
            className="text-sm font-medium transition-colors hover:text-purple-600 flex items-center"
          >
            <Home className="mr-1 h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href={`${basePath}/ref_code`}
            className="text-sm font-medium transition-colors hover:text-purple-600 flex items-center"
          >
            <KeyRound className="mr-1 h-4 w-4" />
            Reference Codes
          </Link>
          <Link
            href={`${basePath}/form_responses`}
            className="text-sm font-medium transition-colors hover:text-purple-600 flex items-center"
          >
            <FileText className="mr-1 h-4 w-4" />
            Form Responses
          </Link>
          {basePath === "/superadmin" && (
            <Link
              href={`${basePath}/admins`}
              className="text-sm font-medium transition-colors hover:text-purple-600 flex items-center"
            >
              <UserPlus className="mr-1 h-4 w-4" />
              Manage Admins
            </Link>
          )}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/" passHref>
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Users className="mr-2 h-4 w-4" />
            View Public Site
          </Button>
        </Link>
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        )}

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4 mt-8">
              <Link
                href={basePath}
                className="flex items-center py-2 text-lg font-medium"
              >
                <Home className="mr-2 h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href={`${basePath}/ref_code`}
                className="flex items-center py-2 text-lg font-medium"
              >
                <KeyRound className="mr-2 h-5 w-5" />
                Reference Codes
              </Link>
              <Link
                href={`${basePath}/form_responses`}
                className="flex items-center py-2 text-lg font-medium"
              >
                <FileText className="mr-2 h-5 w-5" />
                Form Responses
              </Link>
              {basePath === "/superadmin" && (
                <Link
                  href={`${basePath}/admins`}
                  className="flex items-center py-2 text-lg font-medium"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Manage Admins
                </Link>
              )}
              <Link
                href="/"
                className="flex items-center py-2 text-lg font-medium"
              >
                <Users className="mr-2 h-5 w-5" />
                View Public Site
              </Link>
              {isAdmin && (
                <Link
                  href="/login"
                  className="flex items-center py-2 text-lg font-medium"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
