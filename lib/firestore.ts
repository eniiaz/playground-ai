import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';

// Generic CRUD operations for Firestore
export class FirestoreService {
  // Create a document with optional specific ID
  static async create(collectionName: string, data: DocumentData, id?: string) {
    try {
      if (id) {
        // Create document with specific ID
        const docRef = doc(db, collectionName, id);
        await setDoc(docRef, data);
        return { id, ...data };
      } else {
        // Create document with auto-generated ID
        const docRef = await addDoc(collection(db, collectionName), data);
        return { id: docRef.id, ...data };
      }
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  // Read a single document
  static async getById(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  // Read multiple documents with optional queries
  static async getAll(collectionName: string, constraints: QueryConstraint[] = []) {
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  }

  // Update a document
  static async update(collectionName: string, id: string, data: Partial<DocumentData>) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
      return { id, ...data };
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // Delete a document
  static async delete(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
}

// Helper functions for common query patterns
export const queryHelpers = {
  where: (field: string, operator: any, value: any) => where(field, operator, value),
  orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => orderBy(field, direction),
  limit: (count: number) => limit(count),
};
