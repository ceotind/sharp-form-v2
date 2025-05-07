'use client';

import { useState } from 'react';
import { Form, FormBuilder } from '@/components/form-elements';
import { FormField } from '@/types/form';

export default function FormBuilderExample() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  const handleFieldSelect = (field: FormField) => {
    setSelectedFieldId(field.id);
  };

  const handleFormSubmit = (values: Record<string, any>) => {
    console.log('Form submitted:', values);
    alert('Form submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
            <p className="mt-1 text-sm text-gray-500">
              Build your form by dragging and dropping elements from the sidebar
            </p>
            
            <div className="mt-4 flex space-x-4">
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isPreview ? 'Edit Form' : 'Preview Form'}
              </button>
              {isPreview && (
                <button
                  type="button"
                  onClick={() => setFormData({})}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reset Form
                </button>
              )}
            </div>
          </div>

          {isPreview ? (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Form Preview</h2>
              <div className="max-w-2xl mx-auto">
                <Form 
                  fields={fields} 
                  onSubmit={handleFormSubmit}
                  initialValues={formData}
                />
              </div>
            </div>
          ) : (
            <div className="h-[calc(100vh-200px)]">
              <FormBuilder
                fields={fields}
                onChange={setFields}
                onFieldSelect={handleFieldSelect}
                selectedFieldId={selectedFieldId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
