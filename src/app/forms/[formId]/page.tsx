'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Form } from '@/types/form';
import { FormPreview } from '@/components/FormPreview';

const DEFAULT_THEME = {
  background: '#ffffff',
  textColor: '#1f2937',
  accentColor: '#3b82f6',
};

export default function PublishedFormPage({ params }: { params: { formId: string } }) {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const formDoc = await getDoc(doc(db, 'forms', params.formId));
        if (formDoc.exists()) {
          setForm(formDoc.data() as Form);
        }
      } catch (err) {
        console.error('Error fetching form:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [params.formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmissionState('success');
      setFormData({});
    } catch (error) {
      setSubmissionState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const theme = {
    background: form?.settings?.themeBackground || DEFAULT_THEME.background,
    textColor: form?.settings?.textColor || DEFAULT_THEME.textColor,
    accentColor: form?.settings?.accentColor || DEFAULT_THEME.accentColor,
  };

  if (loading || !form) {
    return null;
  }

  return (
    <div className="min-h-screen w-full" style={{ background: theme.background }}>
      <div className="max-w-xl mx-auto min-h-screen flex items-center justify-center px-4">
        <form onSubmit={handleSubmit} className="w-full py-8 space-y-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-2" style={{ color: theme.textColor }}>
              {form.title}
            </h1>
            {form.description && (
              <p className="text-sm" style={{ color: `${theme.textColor}CC` }}>
                {form.description}
              </p>
            )}
          </div>

          <FormPreview
            fields={form.fields}
            formData={formData}
            setFormData={setFormData}
            isSubmitting={isSubmitting}
          />
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50"
            style={{ 
              background: theme.accentColor,
              color: '#ffffff'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>

          {submissionState === 'success' && (
            <div 
              className="px-4 py-3 rounded-lg text-center text-sm" 
              style={{ background: `${theme.accentColor}20`, color: theme.accentColor }}
            >
              Form submitted successfully!
            </div>
          )}
        </form>
      </div>
    </div>
  );
}