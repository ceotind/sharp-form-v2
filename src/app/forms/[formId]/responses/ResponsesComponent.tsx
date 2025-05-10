'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Form, FormResponse } from '@/types/form';

interface ResponsesProps {
  formId: string;
}

export default function ResponsesComponent({ formId }: ResponsesProps) {
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const formDoc = await getDoc(doc(db, 'forms', formId));
        if (formDoc.exists()) {
          setForm({ id: formDoc.id, ...formDoc.data() } as Form);
        }
      } catch (err) {
        console.error('Error fetching form:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  useEffect(() => {
    if (!formId) return;

    const responsesQuery = query(
      collection(db, 'forms', formId, 'responses'),
      orderBy('submittedAt', 'desc')
    );

    const unsubscribe = onSnapshot(responsesQuery, (snapshot) => {
      const responsesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FormResponse[];
      setResponses(responsesList);
    });

    return () => unsubscribe();
  }, [formId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Form not found</h1>
          <p className="text-gray-600">The form you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Form Responses</h1>
        <div className="space-y-4">
          {responses.map((response) => (
            <div key={response.id} className="border rounded p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-gray-500">
                    Submitted at: {response.submittedAt?.toDate().toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {Object.entries(response.data || {}).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="font-medium w-1/3">{key}:</span>
                    <span className="w-2/3">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {responses.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No responses yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
