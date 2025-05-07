'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Form } from '@/types/form';
import Link from 'next/link';
import { Edit2, Eye, Trash2, Plus, LogOut, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function FormsSidebar() {
  const router = useRouter();
  const [forms, setForms] = useState<(Form & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  useEffect(() => {
    const q = query(collection(db, 'forms'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const formsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (Form & { id: string })[];
      
      setForms(formsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    setDeletingId(formId);
    try {
      await deleteDoc(doc(db, 'forms', formId));
      // If we're currently on the deleted form's page, redirect to home
      if (window.location.pathname.includes(formId)) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Failed to delete form. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSignOut = () => {
    // Will implement later
    console.log('Sign out clicked');
  };

  const handleSignIn = () => {
    // Will implement later
    console.log('Sign in clicked');
  };

  const handleCreateNewForm = async () => {
    try {
      const newFormData: Form = {
        title: 'Untitled Form',
        description: '',
        fields: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        published: false,
        createdBy: 'anonymous', // TODO: Replace with actual user ID when auth is implemented
        settings: {
          allowMultipleResponses: true,
          customSuccessMessage: 'Thank you for your submission!',
          customErrorMessage: 'There was an error submitting your form. Please try again.',
        }
      };

      const docRef = await addDoc(collection(db, 'forms'), newFormData);
      router.push(`/forms/${docRef.id}/edit`);
    } catch (error) {
      console.error('Error creating new form:', error);
      alert('Failed to create new form. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Saved Forms</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Saved Forms</h2>
        <button
          onClick={handleCreateNewForm}
          className="p-2 text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-50"
          title="Create new form"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Auth buttons */}
      <div className="mb-4">
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleSignIn}
            className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 w-full"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {forms.map((form) => (
          <div
            key={form.id}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <h3 className="font-medium text-gray-900 truncate">{form.title}</h3>
            <p className="text-sm text-gray-500 mb-3 truncate">
              {form.description || 'No description'}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Link
                  href={`/forms/${form.customSlug || form.id}`}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Link>
                <Link
                  href={`/forms/${form.id}/edit`}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-700"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Link>
              </div>
              <button
                onClick={() => handleDelete(form.id)}
                disabled={deletingId === form.id}
                className="flex items-center text-sm text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete form"
              >
                {deletingId === form.id ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
        {forms.length === 0 && (
          <p className="text-gray-500 text-center py-4">No forms created yet</p>
        )}
      </div>
    </div>
  );
}