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
import FormBuilderLayout from '@/components/FormBuilderLayout';

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
    <FormBuilderLayout
      forms={[]}  // You can pass empty array or fetch forms if needed
      onEditForm={() => {}}
      onDeleteForm={() => {}}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Preview Column - Takes 1/2 width */}
          <div className="xl:w-1/2 order-2 xl:order-1">
            <div className="sticky top-4">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Form Preview</h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-900">{formTitle || 'Untitled Form'}</h3>
                      {formDescription && <p className="text-gray-500">{formDescription}</p>}
                    </div>
                    <div className="border-t border-gray-100 pt-6">
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
              </div>
            </div>
          </div>

          {/* Builder Column - Takes 1/2 width */}
          <div className="xl:w-1/2 order-1 xl:order-2 space-y-6">
            {/* Form Details Card */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Form Details</h2>
                <div className="space-y-4 lg:space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Form Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your form title"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Form Description
                    </label>
                    <textarea
                      id="description"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Enter a description for your form"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="customSlug" className="block text-sm font-medium text-gray-700">
                      Custom URL Slug
                    </label>
                    <input
                      type="text"
                      id="customSlug"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter custom URL slug (optional)"
                    />
                  </div>

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving Changes...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Form Elements Card */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Form Elements</h2>
                <div className="border-t border-gray-200 pt-4 lg:pt-6">
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
        </div>
      </div>
    </FormBuilderLayout>
  );
}