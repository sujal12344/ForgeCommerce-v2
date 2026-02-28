"use client";

import { Button } from "@/components/ui/button";
import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_STORE_ID } from "@/lib/constants";

export default function AutoLoginButton() {
  const { signIn, isLoaded } = useSignIn();
  const [isLogging, setIsLogging] = useState(false);
  const router = useRouter();
  const handleAutoLogin = async () => {
    if (!isLoaded || !signIn) return;

    setIsLogging(true);

    try {
      const res = await fetch("/api/demo-login");
      if (!res.ok) throw new Error("Failed to fetch demo credentials");
      const { email, password } = await res.json() as { email: string; password: string };

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
          "rounded-lg px-6 py-2",
        )}
      >
        {isLogging ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Logging in...</span>
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
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
