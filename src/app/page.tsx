"use client";

import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/icons/logo";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && user && user.email !== "guest@example.com") {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || (user && user.email !== "guest@example.com")) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full gap-6">
      <LoginForm />
    </div>
  );
}
