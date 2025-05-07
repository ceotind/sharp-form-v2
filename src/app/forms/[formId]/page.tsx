'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Form } from '@/types/form';
import { FormPreview } from '@/components/FormPreview';

const DEFAULT_THEME = {
  background: 'linear-gradient(135deg, #1e2761 0%, #2d1e4a 100%)',
  textColor: '#fff',
  accentColor: '#ffb4a2',
};

export default function PublishedFormPage({ params }: { params: { formId: string } }) {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const formDoc = await getDoc(doc(db, 'forms', params.formId));
        if (!formDoc.exists()) {
          setError('Form not found');
          return;
        }
        const formData = formDoc.data() as Form;
        setForm(formData);
      } catch (err) {
        console.error('Error fetching form:', err);
        setError('Failed to load form');
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [params.formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionState('idle');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmissionState('success');
      setFormData({});
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmissionState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Theme logic
  const theme = {
    background: form?.settings?.themeBackground || DEFAULT_THEME.background,
    textColor: form?.settings?.textColor || DEFAULT_THEME.textColor,
    accentColor: form?.settings?.accentColor || DEFAULT_THEME.accentColor,
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: theme.background }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.accentColor }}></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: theme.background }}>
        <div className="text-red-300 text-lg font-semibold">{error}</div>
      </div>
    );
  }
  if (!form) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: theme.background }}>
        <div className="text-gray-300 text-lg font-semibold">Form not found</div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: theme.background }}
    >
      {/* Decorative SVG or background pattern can be added here for more style */}
      <div className="w-full h-full flex flex-col items-center justify-center relative">
        <div
          className="w-full max-w-xl mx-auto rounded-2xl shadow-2xl p-8"
          style={{ background: 'rgba(255,255,255,0.08)', color: theme.textColor, backdropFilter: 'blur(8px)' }}
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: theme.textColor }}>{form.title}</h1>
          {form.description && (
            <p className="mb-6 text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>{form.description}</p>
          )}
          <form onSubmit={handleSubmit}>
            <FormPreview
              fields={form.fields}
              formData={formData}
              setFormData={setFormData}
              isSubmitting={isSubmitting}
            />
            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-lg text-lg font-semibold shadow-md transition bg-pink-300 hover:bg-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: theme.accentColor, color: '#222' }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
          {submissionState === 'success' && (
            <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
              Form submitted successfully!
            </div>
          )}
          {submissionState === 'error' && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
              Failed to submit form. Please try again.
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="absolute bottom-4 right-6 text-xs text-pink-200 opacity-80 select-none">
          From <span className="font-semibold">Sharp Digital</span>
        </div>
      </div>
    </div>
  );
} 