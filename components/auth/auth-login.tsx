"use client";

import { Button } from "@/components/ui/button";
import { DEMO_STORE_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useSignIn } from "@clerk/nextjs";
import { Loader2Icon, LogInIcon } from "lucide-react";
import { useState } from "react";
import { useToast } from "../ui/use-toast";

export default function AutoLoginButton() {
  const { signIn, isLoaded } = useSignIn();
  const [isLogging, setIsLogging] = useState(false);
  const { toast } = useToast();
  const handleAutoLogin = async () => {
    if (!isLoaded || !signIn) return;

    setIsLogging(true);

    try {
      const email = process.env.NEXT_PUBLIC_DEMO_USER_EMAIL;
      const password = process.env.NEXT_PUBLIC_DEMO_USER_PASSWORD;
      if (!email || !password)
        throw new Error("Demo credentials not configured");

      const signInAttempt = await signIn.create({
        identifier: email,
      });

      const result = await signInAttempt.attemptFirstFactor({
        strategy: "password",
        password,
      });

      if (result.status === "complete") {
        window.location.href = `/${DEMO_STORE_ID}`;
      } else {
        console.error("Sign in incomplete:", result);
      }
    } catch (err) {
      console.error("Auto login error details:", err);
      toast({
        title: "Auto login failed",
        description:
          err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2 mt-4">
      <Button
        onClick={handleAutoLogin}
        disabled={isLogging || !isLoaded}
        variant="default"
        size="lg"
        className={cn(
          "relative w-full max-w-xs transition-all duration-200",
          "bg-linear-to-r transition-colors from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
          "text-white font-medium shadow-md hover:shadow-lg",
          "rounded-lg px-6 py-2"
        )}
      >
        {isLogging ? (
          <>
            <Loader2Icon className="mr-2 size-4 animate-spin" />
            <span>Logging in...</span>
          </>
        ) : (
          <>
            <LogInIcon className="mr-2 size-4" />
            <span>Quick Login (Test)</span>
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        Sign in directly to test out the store
      </p>
    </div>
  );
}
