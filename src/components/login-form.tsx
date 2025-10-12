"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, LockKeyhole, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  loginWithEmailAndPassword,
  setAuthCookies,
} from "@/lib/firebase/client";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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

      // Check if user has admin privileges
      const idTokenResult = await userCredential.user.getIdTokenResult();
      const isUserAdmin = idTokenResult.claims.admin === true;

      if (isUserAdmin) {
        router.push("/admin");
      } else {
        toast("Access denied. Admin privileges required.");
        await userCredential.user.delete(); // Optional: delete non-admin user
      }
    } catch (error) {
      console.error("Login error:", error);
      toast("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="admin@example.com"
                      className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                      {...field}
                    />
                  </div>
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
                <FormLabel className="text-gray-700">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="password"
                      placeholder="••••••"
                      className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 group"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                Login
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
