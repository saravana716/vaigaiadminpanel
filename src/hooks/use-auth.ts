
"use client";

import type { User as AppUser } from '@/lib/types';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from './use-toast';

// A mock user for when auth is loading or not available
const mockUser: AppUser = {
  name: 'Guest',
  email: 'guest@example.com',
  avatarUrl: 'https://placehold.co/100x100.png',
};

export const useAuth = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = React.useState<AppUser>(mockUser);
  const [loading, setLoading] = React.useState(true);

  const fetchUserProfile = React.useCallback(async (uid: string, email: string, defaultName?: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('uid', uid)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user profile:", error);
      }

      if (profile) {
        setUser({
          name: profile.name || defaultName || 'User',
          email: profile.email || email,
          avatarUrl: profile.avatarUrl || `https://placehold.co/100x100.png?text=${encodeURIComponent((profile.name || defaultName || 'U').charAt(0))}`,
        });
      } else {
        setUser({
          name: defaultName || 'User',
          email: email,
          avatarUrl: `https://placehold.co/100x100.png?text=${encodeURIComponent((defaultName || 'U').charAt(0))}`,
        });
      }
    } catch (e) {
      console.error("Failed to fetch user profile:", e);
    }
  }, []);

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user.id, session.user.email || '', session.user.user_metadata?.name);
        } else {
          setUser(mockUser);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setUser(mockUser);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email || '', session.user.user_metadata?.name);
      } else {
        setUser(mockUser);
        router.push('/');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, fetchUserProfile]);


  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/');
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  return { user, loading, logout };
};

