import { FirestoreService, queryHelpers } from "./firestore";

export interface UserProfile {
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt: Date | null;
  emailVerified: boolean;
  // App-specific fields
  preferences: {
    theme: "light" | "dark";
    notifications: boolean;
  };
  stats: {
    notesCount: number;
    ideasCount: number;
    resourcesCount: number;
  };
}

export class UserSyncService {
  // Create or update user profile in Firestore
  static async syncUserProfile(clerkUser: {
    id: string;
    emailAddresses: Array<{ emailAddress: string; verification?: { status: string } }>;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
    createdAt: number;
    lastSignInAt: number | null;
    updatedAt: number;
  }): Promise<UserProfile> {
    const email = clerkUser.emailAddresses[0]?.emailAddress || "";
    const emailVerified = clerkUser.emailAddresses[0]?.verification?.status === "verified";
    
    const userProfile: Omit<UserProfile, "stats"> = {
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      fullName: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User",
      imageUrl: clerkUser.imageUrl,
      createdAt: new Date(clerkUser.createdAt),
      updatedAt: new Date(clerkUser.updatedAt),
      lastSignInAt: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt) : null,
      emailVerified,
      preferences: {
        theme: "light",
        notifications: true,
      },
    };

    try {
      // Check if user already exists
      const existingUser = await FirestoreService.getById("users", clerkUser.id);
      
      if (existingUser) {
        // Update existing user, preserve stats and preferences
        const existingUserProfile = existingUser as unknown as UserProfile;
        const updatedUser = {
          ...userProfile,
          preferences: existingUserProfile.preferences || userProfile.preferences,
          stats: existingUserProfile.stats || { notesCount: 0, ideasCount: 0, resourcesCount: 0 },
        };
        
        await FirestoreService.update("users", clerkUser.id, updatedUser);
        return updatedUser as UserProfile;
      } else {
        // Create new user with Clerk user ID as document ID
        const newUser = {
          ...userProfile,
          stats: { notesCount: 0, ideasCount: 0, resourcesCount: 0 },
        };
        
        await FirestoreService.create("users", newUser, clerkUser.id);
        return newUser as UserProfile;
      }
    } catch (error) {
      console.error("Error syncing user profile:", error);
      throw error;
    }
  }

  // Get user profile from Firestore
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const user = await FirestoreService.getById("users", userId);
      return user as UserProfile | null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  }

  // Update user stats when content is created/deleted
  static async updateUserStats(userId: string, type: "notes" | "ideas" | "resources", increment: number = 1) {
    try {
      const user = await this.getUserProfile(userId);
      if (!user) return;

      const statField = type === "notes" ? "notesCount" : 
                       type === "ideas" ? "ideasCount" : "resourcesCount";
      
      const newStats = {
        ...user.stats,
        [statField]: Math.max(0, user.stats[statField] + increment),
      };

      await FirestoreService.update("users", userId, {
        stats: newStats,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating user stats:", error);
    }
  }

  // Update user preferences
  static async updateUserPreferences(userId: string, preferences: Partial<UserProfile["preferences"]>) {
    try {
      const user = await this.getUserProfile(userId);
      if (!user) return;

      const newPreferences = { ...user.preferences, ...preferences };
      
      await FirestoreService.update("users", userId, {
        preferences: newPreferences,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating user preferences:", error);
    }
  }

  // Delete user and all their data
  static async deleteUser(userId: string) {
    try {
      // Delete user's notes
      const notes = await FirestoreService.getAll("notes", [
        queryHelpers.where("userId", "==", userId)
      ]);
      for (const note of notes) {
        await FirestoreService.delete("notes", note.id);
      }

      // Delete user's business ideas
      const ideas = await FirestoreService.getAll("businessIdeas", [
        queryHelpers.where("userId", "==", userId)
      ]);
      for (const idea of ideas) {
        await FirestoreService.delete("businessIdeas", idea.id);
      }

      // Delete user's library resources
      const resources = await FirestoreService.getAll("libraryResources", [
        queryHelpers.where("userId", "==", userId)
      ]);
      for (const resource of resources) {
        await FirestoreService.delete("libraryResources", resource.id);
      }

      // Delete user profile
      await FirestoreService.delete("users", userId);
    } catch (error) {
      console.error("Error deleting user data:", error);
      throw error;
    }
  }
}
