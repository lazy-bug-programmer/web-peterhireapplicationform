"use client";

import { useState } from "react";
import { createReferralCode } from "@/lib/actions/referral_codes.action";
import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function RefCodeGenerator({
  onCodeCreated,
}: {
  onCodeCreated?: () => void;
}) {
  const { userProfile } = useAuth();
  const [code, setCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRandomCode = () => {
    // Generate a random 6-character alphanumeric code
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast("Please enter a code or generate one.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await createReferralCode({
        code,
        createdBy: userProfile?.$id,
      });

      if (response.success) {
        toast(`Reference code "${code}" has been created.`);
        setCode("");

        // Call the onCodeCreated callback to trigger a refresh in the parent component
        if (onCodeCreated) {
          onCodeCreated();
        }
      } else {
        toast(response.error || "Failed to create reference code.");
      }
    } catch {
      toast("An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Reference Code</CardTitle>
        <CardDescription>
          Create new reference codes for applicants to use.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter code or generate one"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="flex-1"
              maxLength={10}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={generateRandomCode}
              title="Generate random code"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <Button type="submit" className="w-full" disabled={isGenerating}>
            {isGenerating ? "Creating..." : "Create Reference Code"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
