
"use client";

import type { User as AppUser } from '@/lib/types';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
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

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUser(userDoc.data() as AppUser);
          } else {
            // This case might happen if user record in Firestore is deleted
            // but they are still authenticated.
            setUser({
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || 'no-email@example.com',
              avatarUrl: firebaseUser.photoURL || `https://placehold.co/100x100.png?text=${firebaseUser.email?.charAt(0) || 'A'}`,
            });
          }
        } catch (error) {
           console.error("Error fetching user data:", error);
           setUser(mockUser); // Fallback to mock user on error
        }
      } else {
        setUser(mockUser); // No user signed in
        router.push('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);


  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/');
    } catch(error: any) {
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
