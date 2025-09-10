'use client'

import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/icons/logo";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from 'react';


export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && user && user.email !== 'guest@example.com') {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);


  if (loading || (user && user.email !== 'guest@example.com')) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex items-center justify-center gap-2">
               <Logo className="h-8 w-8 text-primary" />
               <h1 className="text-3xl font-bold font-headline">Vaigai Admin</h1>
            </div>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://placehold.co/1200x900.png"
          alt="Image"
          width="1920"
          height="1080"
          data-ai-hint="abstract geometric"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
