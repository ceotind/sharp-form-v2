'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Form, FormResponse } from '@/types/form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';

export default function FormResponsesPage({ params }: { params: { formId: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const formDoc = await getDoc(doc(db, 'forms', params.formId));
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
  }, [params.formId]);

  useEffect(() => {
    if (!params.formId) return;

    const responsesQuery = query(
      collection(db, 'forms', params.formId, 'responses'),
      orderBy('submittedAt', 'desc')
    );

    const unsubscribe = onSnapshot(responsesQuery, (snapshot) => {
      const responsesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FormResponse[];
      setResponses(responsesData);
    });

    return () => unsubscribe();
  }, [params.formId]);

  const handleExportCSV = () => {
    if (!form || responses.length === 0) return;

    // Prepare headers
    const headers = form.fields.map((field) => `"${field.label}"`).join(',');
    
    // Prepare rows
    const rows = responses.map((response) => {
      return form.fields
        .map((field) => {
          const fieldResponse = response.responses.find((r) => r.fieldId === field.id);
          const value = fieldResponse?.value;
          // Convert array values to comma-separated strings
          const formattedValue = Array.isArray(value) 
            ? value.join(', ')
            : value;
          // Escape quotes and wrap in quotes
          return `"${String(formattedValue || '').replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    // Combine headers and rows
    const csvContent = [headers, ...rows].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${form.title.replace(/\s+/g, '_')}_responses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleString();
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!form) {
    return <div className="p-8">Form not found</div>;
  }


  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Button
            variant="ghost"
            className="mb-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to form
          </Button>
          <h1 className="text-2xl font-bold">{form.title} - Responses</h1>
          <p className="text-sm text-gray-500">
            {responses.length} {responses.length === 1 ? 'response' : 'responses'}
          </p>
        </div>
        <Button onClick={handleExportCSV} disabled={responses.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {responses.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">No responses yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {responses.map((response) => (
            <div key={response.id} className="border rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">
                  Response on {formatDate(response.submittedAt)}
                </h3>
              </div>
              <div className="space-y-4">
                {form.fields.map((field) => {
                  const fieldResponse = response.responses.find(
                    (r) => r.fieldId === field.id
                  );
                  const value = fieldResponse?.value;

                  return (
                    <div key={field.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <h4 className="text-sm font-medium text-gray-700">
                        {field.label}
                      </h4>
                      <p className="mt-1">
                        {Array.isArray(value) ? value.join(', ') : String(value || 'N/A')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
