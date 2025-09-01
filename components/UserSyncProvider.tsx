"use client";

import { useUserSync } from "@/hooks/useUserSync";

export function UserSyncProvider({ children }: { children: React.ReactNode }) {
  // This component ensures user sync happens when the app loads
  const { isLoading } = useUserSync();

  // We don't need to show loading here since individual pages handle their own loading states
  // This just runs the sync logic in the background
  return <>{children}</>;
}
