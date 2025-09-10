'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { loginSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      if (isSignUp) {
        // Sign up
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;
        // Add user to firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: data.name,
          email: data.email,
          avatarUrl: `https://placehold.co/100x100.png?text=${data.name?.charAt(0) || 'A'}`,
        });
        toast({
          title: "Account Created",
          description: "Welcome! You've been signed up successfully.",
        });
        router.push('/dashboard');
      } else {
        // Login
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast({
          title: "Login Successful",
          description: "Welcome back! Redirecting to your dashboard.",
        });
        router.push('/dashboard');
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

  return (
    <>
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
                    <a href="#" className="ml-auto inline-block text-sm underline">
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
            {isLoading ? "Processing..." : isSignUp ? 'Sign Up' : 'Login'}
          </Button>
          <Button variant="outline" className="w-full" disabled={isLoading}>
            Login with Google
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}
        <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="underline">
          {isSignUp ? "Login" : "Sign up"}
        </Button>
      </div>
    </>
  );
}
