"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { UserSyncService, UserProfile } from "@/lib/user-sync";

export function useUserSync() {
  const { user, isLoaded } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded) return;
      
      setIsLoading(true);
      
      if (user) {
        try {
          // Check if user exists in Firestore
          let profile = await UserSyncService.getUserProfile(user.id);
          
          if (!profile) {
            // User doesn't exist in Firestore, create them
            profile = await UserSyncService.syncUserProfile({
              id: user.id,
              emailAddresses: user.emailAddresses.map(email => ({
                emailAddress: email.emailAddress,
                verification: email.verification ? { status: email.verification.status || "unverified" } : undefined,
              })),
              firstName: user.firstName,
              lastName: user.lastName,
              imageUrl: user.imageUrl,
              createdAt: user.createdAt ? user.createdAt.getTime() : Date.now(),
              updatedAt: user.updatedAt ? user.updatedAt.getTime() : Date.now(),
              lastSignInAt: user.lastSignInAt ? user.lastSignInAt.getTime() : null,
            });
          } else {
            // Update existing user profile with latest Clerk data
            profile = await UserSyncService.syncUserProfile({
              id: user.id,
              emailAddresses: user.emailAddresses.map(email => ({
                emailAddress: email.emailAddress,
                verification: email.verification ? { status: email.verification.status || "unverified" } : undefined,
              })),
              firstName: user.firstName,
              lastName: user.lastName,
              imageUrl: user.imageUrl,
              createdAt: user.createdAt ? user.createdAt.getTime() : Date.now(),
              updatedAt: user.updatedAt ? user.updatedAt.getTime() : Date.now(),
              lastSignInAt: user.lastSignInAt ? user.lastSignInAt.getTime() : null,
            });
          }
          
          setUserProfile(profile);
        } catch (error) {
          console.error("Error syncing user:", error);
        }
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    };

    syncUser();
  }, [user, isLoaded]);

  return {
    userProfile,
    isLoading: isLoading || !isLoaded,
    refreshUserProfile: async () => {
      if (user) {
        const profile = await UserSyncService.getUserProfile(user.id);
        setUserProfile(profile);
      }
    },
  };
}
