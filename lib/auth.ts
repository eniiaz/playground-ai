import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Get current user ID (server-side)
export async function getCurrentUserId() {
  const { userId } = await auth();
  return userId;
}

// Get current user object (server-side)
export async function getCurrentUser() {
  return await currentUser();
}

// Protect a page - redirect to sign-in if not authenticated
export async function protectPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  return userId;
}

// Check if user is authenticated (server-side)
export async function isAuthenticated() {
  const { userId } = await auth();
  return !!userId;
}

// Get user metadata
export async function getUserMetadata() {
  const user = await currentUser();
  
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    imageUrl: user.imageUrl,
    createdAt: user.createdAt,
    lastSignInAt: user.lastSignInAt,
  };
}
