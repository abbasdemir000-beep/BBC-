import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase';

export async function getDocument<T extends DocumentData>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as unknown as T) : null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}

export async function getCollection<T extends DocumentData>(
  collectionName: string
): Promise<(T & { id: string })[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as T & { id: string }));
  } catch (error) {
    console.error('Error getting collection:', error);
    throw error;
  }
}

export async function setDocument<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data);
  } catch (error) {
    console.error('Error setting document:', error);
    throw error;
  }
}

export async function updateDocument<T extends Partial<DocumentData>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

export async function queryDocuments<T extends DocumentData>(
  collectionName: string,
  field: string,
  operator: Parameters<typeof where>[1],
  value: unknown
): Promise<(T & { id: string })[]> {
  try {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as T & { id: string }));
  } catch (error) {
    console.error('Error querying documents:', error);
    throw error;
  }
}
