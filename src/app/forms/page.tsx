'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Form } from '@/types/form';
import { Edit2, FileText, PlusSquare, Trash2 } from 'lucide-react';

export default function FormsPage() {
  const { user } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForms = async () => {
      if (!user) return;      try {
        // First, try with compound query
        try {
          const formsQuery = query(
            collection(db, 'forms'),
            where('createdBy', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
          const querySnapshot = await getDocs(formsQuery);
          const formsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Form[];
          setForms(formsList);
        } catch (indexError: any) {
          // If index error, fall back to simple query without ordering
          if (indexError?.code === 'failed-precondition') {
            console.warn('Index not yet ready, falling back to unordered query');
            const simpleQuery = query(
              collection(db, 'forms'),
              where('createdBy', '==', user.uid)
            );
            const querySnapshot = await getDocs(simpleQuery);
            const formsList = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Form[];
            // Sort in memory as fallback
            formsList.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
            setForms(formsList);
          } else {
            throw indexError;
          }
        }

        setForms(formsList);
      } catch (err) {
        setError('Failed to fetch forms');
        console.error('Error fetching forms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [user]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Forms</h1>
        <Link
          href="/forms/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusSquare className="w-4 h-4 mr-2" />
          Create Form
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No forms</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new form.</p>
          <div className="mt-6">
            <Link
              href="/forms/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusSquare className="w-4 h-4 mr-2" />
              Create Form
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {forms.map((form) => (
              <li key={form.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <div className="flex text-sm">
                        <p className="font-medium text-blue-600 truncate">{form.title}</p>
                        <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                          {form.isPublished ? '• Published' : '• Draft'}
                        </p>
                      </div>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-gray-500">
                          <p>
                            Created at {new Date(form.createdAt.seconds * 1000).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0 flex space-x-2">
                    <Link
                      href={`/forms/${form.id}/edit`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                    <button
                      onClick={() => {
                        // Handle delete
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Delete</span>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
