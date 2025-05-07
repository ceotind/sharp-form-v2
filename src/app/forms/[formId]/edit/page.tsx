'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Form, FormField } from '@/types/form';
import { FormBuilder } from '@/components/FormBuilder';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { SortableField } from '@/components/SortableField';

export default function EditFormPage({ params }: { params: { formId: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [customSlug, setCustomSlug] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const docRef = doc(db, 'forms', params.formId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const formData = docSnap.data() as Form;
          setForm(formData);
          setFormTitle(formData.title);
          setFormDescription(formData.description || '');
          setFields(formData.fields);
          setCustomSlug(formData.customSlug || '');
        } else {
          setError('Form not found');
        }
      } catch (err) {
        console.error('Error fetching form:', err);
        setError('Failed to load form');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [params.formId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleFieldUpdate = (updatedField: FormField) => {
    setFields(prev => prev.map(field => 
      field.id === updatedField.id ? updatedField : field
    ));
    setEditingField(null);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      setError('Please enter a form title');
      return;
    }

    if (fields.length === 0) {
      setError('Please add at least one field to your form');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const formData = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        fields,
        updatedAt: new Date(),
        ...(customSlug && { customSlug: customSlug.trim() })
      };

      await updateDoc(doc(db, 'forms', params.formId), formData);
      router.push(`/forms/${params.formId}`);
    } catch (err) {
      console.error('Error saving form:', err);
      if (err instanceof Error) {
        setError(`Failed to save form: ${err.message}`);
      } else {
        setError('Failed to save form. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error || 'Form not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Form Preview Card - Spans 5 columns */}
          <div className="col-span-5">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Form Preview</h2>
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">{formTitle || 'Untitled Form'}</h3>
                {formDescription && <p className="text-gray-600">{formDescription}</p>}
                
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={fields} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                      {fields.map((field) => (
                        <SortableField
                          key={field.id}
                          field={field}
                          onEdit={() => setEditingField(field)}
                          onRemove={() => setFields(prev => prev.filter(f => f.id !== field.id))}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>

          {/* Form Details and Elements Cards - Spans 7 columns */}
          <div className="col-span-7 space-y-8">
            {/* Form Details Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Form Details</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Form Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter form title"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Form Description
                  </label>
                  <textarea
                    id="description"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter form description"
                    rows={3}
                  />
                </div>

                <div>
                  <label htmlFor="customSlug" className="block text-sm font-medium text-gray-700 mb-2">
                    Custom URL Slug
                  </label>
                  <input
                    type="text"
                    id="customSlug"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter custom URL slug (optional)"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Leave empty to use the auto-generated form ID
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Form Elements Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Form Elements</h2>
              <div className="border-t border-gray-200 pt-4">
                <FormBuilder
                  initialFields={fields}
                  onChange={setFields}
                  editingField={editingField}
                  onFieldUpdate={handleFieldUpdate}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 