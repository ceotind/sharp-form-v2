import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useFirestore<T = DocumentData>(
  collectionName: string,
  queryConstraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...queryConstraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(items);
        setLoading(false);
      },
      (error) => {
        setError(error as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(queryConstraints)]);

  const add = async (item: Omit<T, 'id'>) => {
    try {
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, item);
      return docRef.id;
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const update = async (id: string, item: Partial<T>) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, item as DocumentData);
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  return {
    data,
    loading,
    error,
    add,
    update,
    remove,
  };
} 