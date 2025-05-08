'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db, FORMS_COLLECTION, RESPONSES_COLLECTION } from '@/lib/firebase';
import { Form, FormResponse } from '@/types/form';
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
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    const fetchForm = async () => {
      try {
        const formDoc = await getDoc(doc(db, FORMS_COLLECTION, params.formId));
        if (formDoc.exists() && isMounted) {
          setForm(formDoc.data() as Form);
        }
      } catch (err) {
        console.error('Error fetching form:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchForm();
    
    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
    };
  }, [params.formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionState('idle');
    
    try {
      // Validate required fields
      const requiredFields = form?.fields.filter(field => field.required);
      const missingFields = requiredFields?.filter(field => !formData[field.id]);
      
      if (missingFields && missingFields.length > 0) {
        const errorMessage = `Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`;
        setErrorMessage(errorMessage);
        throw new Error(errorMessage);
      }

      // Prepare response data
      const responseData: FormResponse = {
        formId: params.formId,
        responses: Object.entries(formData).map(([fieldId, value]) => ({
          fieldId,
          value: value || ''
        })),
        submittedAt: new Date(),
        metadata: {
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
          timestamp: serverTimestamp()
        }
      };

      // Save to Firestore
      const responsesCollection = collection(db, FORMS_COLLECTION, params.formId, 'responses');
      await addDoc(responsesCollection, responseData);
      
      // Update form stats
      const formRef = doc(db, FORMS_COLLECTION, params.formId);
      await setDoc(formRef, {
        responseCount: (form?.responseCount || 0) + 1,
        lastResponseAt: serverTimestamp()
      }, { merge: true });
      
      setSubmissionState('success');
      setFormData({});
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmissionState('error');
      // Set error message to show in UI
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use useMemo to prevent theme recalculation on every render
  const theme = useMemo(() => ({
    background: form?.settings?.themeBackground || DEFAULT_THEME.background,
    textColor: form?.settings?.textColor || DEFAULT_THEME.textColor,
    accentColor: form?.settings?.accentColor || DEFAULT_THEME.accentColor,
  }), [form?.settings?.themeBackground, form?.settings?.textColor, form?.settings?.accentColor]);

  // Show loading state to prevent hydration errors
  if (typeof window === 'undefined') {
    // Server-side rendering - return minimal loading UI
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="p-8 text-center">Loading form...</div>
      </div>
    );
  }
  
  // Client-side - only render when data is available
  if (loading || !form) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="p-8 text-center">Loading form...</div>
      </div>
    );
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
              className="px-4 py-3 rounded-lg text-center text-sm mb-4" 
              style={{ 
                background: `${theme.accentColor}20`, 
                color: theme.accentColor,
                border: `1px solid ${theme.accentColor}40`
              }}
            >
              {form.settings?.customSuccessMessage || 'Form submitted successfully!'}
            </div>
          )}
          
          {submissionState === 'error' && errorMessage && (
            <div 
              className="px-4 py-3 rounded-lg text-center text-sm mb-4"
              style={{
                background: '#FEE2E2',
                color: '#B91C1C',
                border: '1px solid #FCA5A5'
              }}
            >
              {form.settings?.customErrorMessage || errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}