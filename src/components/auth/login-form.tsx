"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      if (isSignUp) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
            }
          }
        });
        
        if (signUpError) throw signUpError;
        
        const user = signUpData.user;
        if (user) {
          const { error: dbError } = await supabase.from("users").insert({
            uid: user.id,
            name: data.name,
            email: data.email,
            avatarUrl: `https://placehold.co/100x100.png?text=${encodeURIComponent(
              data.name?.charAt(0) || "A"
            )}`,
          });
          if (dbError) {
            console.error("Profile creation error:", dbError);
          }
        }
        
        toast({
          title: "Account Created",
          description: "Welcome! You've been signed up successfully.",
        });
        router.push("/dashboard");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        
        if (signInError) throw signInError;
        
        toast({
          title: "Login Successful",
          description: "Welcome back! Redirecting to your dashboard.",
        });
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Google Login Failed",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            {isSignUp ? "Sign Up" : "Login"}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp
              ? "Create your account to get started"
              : "Enter your email to login to your account"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {isSignUp && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
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
                  <div className="flex items-center">
                    <FormLabel>Password</FormLabel>
                    {!isSignUp && (
                      <a href="#" className="ml-auto text-sm underline">
                        Forgot your password?
                      </a>
                    )}
                  </div>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Login"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              disabled={isLoading}
              onClick={handleGoogleLogin}
            >
              Login with Google
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="underline px-1"
          >
            {isSignUp ? "Login" : "Sign up"}
          </Button>
        </div>
      </div>
    </div>
  );
}

