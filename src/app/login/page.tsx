"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  loginWithEmailAndPassword,
  setAuthCookies,
} from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth-context";
import { checkUserAdminPrivileges } from "@/lib/actions/user_profile.action";
import { UserRole } from "@/lib/domains/user_profile.domain";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isLoggedIn, isAdmin, userProfile } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Auto-redirect if user is already logged in and is admin
  useEffect(() => {
    if (isLoggedIn && isAdmin && userProfile) {
      if (userProfile.role === UserRole.SUPER_ADMIN) {
        router.push("/superadmin");
      } else if (userProfile.role === UserRole.ADMIN) {
        router.push("/admin");
      }
    }
  }, [isLoggedIn, isAdmin, userProfile, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Use Firebase authentication
      const userCredential = await loginWithEmailAndPassword(
        values.email,
        values.password
      );

      // Set auth cookies for middleware
      await setAuthCookies(userCredential.user);

      // Check if user has admin privileges using user profile
      const adminCheckResult = await checkUserAdminPrivileges(
        userCredential.user.uid
      );

      if (adminCheckResult.success && adminCheckResult.hasAdminPrivileges) {
        const userProfile = adminCheckResult.userProfile;
        toast.success("Login successful!");

        // Redirect based on user role
        if (userProfile?.role === UserRole.SUPER_ADMIN) {
          router.push("/superadmin");
        } else if (userProfile?.role === UserRole.ADMIN) {
          router.push("/admin");
        } else {
          // Fallback to admin if role is not properly defined
          router.push("/admin");
        }
      } else {
        // Sign out the user since they don't have admin privileges
        const { logoutUser } = await import("@/lib/firebase/client");
        await logoutUser();

        const errorMessage = adminCheckResult.userProfile
          ? "Access denied. Admin privileges required."
          : "User profile not found. Please contact administrator.";

        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle specific Firebase auth errors
      let errorMessage =
        "Login failed. Please check your credentials and try again.";

      if (error instanceof Error) {
        const firebaseError = error as { code?: string };
        if (firebaseError.code === "auth/user-not-found") {
          errorMessage = "No account found with this email address.";
        } else if (firebaseError.code === "auth/wrong-password") {
          errorMessage = "Incorrect password.";
        } else if (firebaseError.code === "auth/invalid-email") {
          errorMessage = "Invalid email address format.";
        } else if (firebaseError.code === "auth/user-disabled") {
          errorMessage = "This account has been disabled.";
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Admin Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin area
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your@email.com"
                        type="email"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="********"
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
