import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
} from 'firebase/storage';
import { storage } from './firebase';

export class StorageService {
  // Upload a file
  static async uploadFile(path: string, file: File, onProgress?: (progress: number) => void) {
    try {
      const storageRef = ref(storage, path);
      
      if (onProgress) {
        // Use resumable upload for progress tracking
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            },
            (error) => {
              console.error('Upload error:', error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      } else {
        // Simple upload without progress tracking
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Upload multiple files
  static async uploadFiles(
    files: { path: string; file: File }[],
    onProgress?: (fileIndex: number, progress: number) => void
  ) {
    try {
      const uploadPromises = files.map((fileData, index) =>
        this.uploadFile(
          fileData.path,
          fileData.file,
          onProgress ? (progress) => onProgress(index, progress) : undefined
        )
      );
      
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  }

  // Get download URL for a file
  static async getDownloadURL(path: string) {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  }

  // Delete a file
  static async deleteFile(path: string) {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Delete multiple files
  static async deleteFiles(paths: string[]) {
    try {
      const deletePromises = paths.map((path) => this.deleteFile(path));
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error('Error deleting files:', error);
      throw error;
    }
  }

  // List all files in a directory
  static async listFiles(path: string) {
    try {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          const metadata = await getMetadata(itemRef);
          
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            url,
            size: metadata.size,
            contentType: metadata.contentType,
            timeCreated: metadata.timeCreated,
            updated: metadata.updated,
          };
        })
      );
      
      return files;
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  // Get file metadata
  static async getFileMetadata(path: string) {
    try {
      const storageRef = ref(storage, path);
      return await getMetadata(storageRef);
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw error;
    }
  }
}
