// Example usage of Firebase services
import { FirestoreService, queryHelpers } from './firestore';
import { StorageService } from './storage';

// Example: Create a user document
export async function createUser(userData: { name: string; email: string; age?: number }) {
  return await FirestoreService.create('users', {
    ...userData,
    createdAt: new Date(),
  });
}

// Example: Get all users ordered by creation date
export async function getAllUsers() {
  return await FirestoreService.getAll('users', [
    queryHelpers.orderBy('createdAt', 'desc'),
  ]);
}

// Example: Get users by age range
export async function getUsersByAgeRange(minAge: number, maxAge: number) {
  return await FirestoreService.getAll('users', [
    queryHelpers.where('age', '>=', minAge),
    queryHelpers.where('age', '<=', maxAge),
  ]);
}

// Example: Update user
export async function updateUser(userId: string, updates: Partial<{ name: string; email: string; age: number }>) {
  return await FirestoreService.update('users', userId, {
    ...updates,
    updatedAt: new Date(),
  });
}

// Example: Upload profile picture
export async function uploadProfilePicture(
  userId: string, 
  file: File,
  onProgress?: (progress: number) => void
) {
  const path = `profile-pictures/${userId}/${file.name}`;
  const downloadURL = await StorageService.uploadFile(path, file, onProgress);
  
  // Update user document with profile picture URL
  await FirestoreService.update('users', userId, {
    profilePicture: downloadURL,
    updatedAt: new Date(),
  });
  
  return downloadURL;
}

// Example: Get user's files
export async function getUserFiles(userId: string) {
  const path = `user-files/${userId}/`;
  return await StorageService.listFiles(path);
}
