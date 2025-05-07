'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  addDoc, 
  collection, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  setDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Form, FormField } from '@/types/form';
import { FormBuilder } from '@/components/FormBuilder';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { GripVertical, Pencil, Trash2, UserCircle } from 'lucide-react';
import { SortableField } from '@/components/SortableField';
import FormBuilderLayout from '@/components/FormBuilderLayout';
import { generateFormId } from '@/utils/generateFormId';
import { getIpAddress } from '@/utils/getIpAddress';

export default function CreateFormPage() {
  const router = useRouter();
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Theme state
  const [themeBackground, setThemeBackground] = useState('');
  const [textColor, setTextColor] = useState('');
  const [accentColor, setAccentColor] = useState('');
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeSaveMsg, setThemeSaveMsg] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [forms, setForms] = useState<(Form & { id: string })[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  // New state for sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'forms'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const formsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (Form & { id: string })[];
      setForms(formsList);
    });
    return () => unsubscribe();
  }, []);

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

  const handlePublish = async () => {
    if (!formTitle.trim()) {
      setError('Please enter a form title');
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      // Get IP address first and make sure we have it
      const ipAddress = await getIpAddress();
      if (!ipAddress || ipAddress === 'unknown') {
        console.warn('Could not fetch IP address');
      }
      
      const formId = generateFormId();

      // Create form data with required fields
      const formData = {
        id: formId,
        title: formTitle.trim(),
        createdAt: new Date().toISOString(), // Use ISO string for consistent date format
        ipAddress: ipAddress, // Store the IP address
        metadata: {  // Add metadata object for tracking
          lastModified: new Date().toISOString(),
          created: new Date().toISOString(),
          creatorIp: ipAddress
        },
        // Optional fields below
        description: formDescription.trim() || null,
        fields: fields.length > 0 ? fields : [],
        settings: {
          allowMultipleResponses: true,
          customSuccessMessage: 'Thank you for your submission!',
          customErrorMessage: 'There was an error submitting your form. Please try again.',
          themeBackground: themeBackground || '',
          textColor: textColor || '',
          accentColor: accentColor || ''
        }
      };

      // Save to Firebase with explicit console logging
      await setDoc(doc(db, 'forms', formId), formData);
      
      // Log to verify IP is being saved
      console.log('Form created successfully:', {
        formId,
        ipAddress,
        timestamp: formData.createdAt
      });
      
      router.push(`/forms/${formId}`);

    } catch (err) {
      console.error('Error creating form:', err);
      setError('Failed to create form. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleThemeSave = async (formId: string) => {
    setThemeSaving(true);
    setThemeSaveMsg('');
    try {
      await updateDoc(doc(db, 'forms', formId), {
        'settings.themeBackground': themeBackground,
        'settings.textColor': textColor,
        'settings.accentColor': accentColor,
      });
      setThemeSaveMsg('Theme updated!');
    } catch (e) {
      setThemeSaveMsg('Failed to update theme.');
    } finally {
      setThemeSaving(false);
    }
  };

  async function deleteForm(id: string) {
    await deleteDoc(doc(db, 'forms', id));
  }

  const handleEditForm = async (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (form) {
      setFormTitle(form.title);
      setFormDescription(form.description || '');
      setFields(form.fields);
      if (form.settings) {
        setThemeBackground(form.settings.themeBackground || '');
        setTextColor(form.settings.textColor || '');
        setAccentColor(form.settings.accentColor || '');
      }
      setSelectedFormId(formId);
    }
  };

  // New function to handle form updates
  const handleUpdateForm = async () => {
    if (!selectedFormId || !formTitle.trim()) {
      setError('Please enter a form title');
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const formData = {
        title: formTitle.trim(),
        description: formDescription.trim() || '',
        fields: fields,
        updatedAt: new Date(),
        settings: {
          themeBackground,
          textColor,
          accentColor
        }
      };

      await updateDoc(doc(db, 'forms', selectedFormId), formData);
      router.push(`/forms/${selectedFormId}`);
    } catch (err) {
      console.error('Error updating form:', err);
      setError('Failed to update form. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <FormBuilderLayout
      forms={forms}
      onEditForm={handleEditForm}
      onDeleteForm={deleteForm}
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
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>Form Details</span>
                  <span className="text-sm font-normal text-gray-500">(Step 1 of 3)</span>
                </h2>
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
                    <p className="text-xs text-gray-500">This will be displayed as the heading of your form</p>
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
                    <p className="text-xs text-gray-500">Add context or instructions for form respondents</p>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </p>
                  </div>
                )}

                {/* Form Details Card button section */}
                <div className="mt-6 space-y-4">
                  {selectedFormId ? (
                    // Edit mode - Show Save Changes and Delete buttons
                    <div className="flex gap-4">
                      <button
                        onClick={handleUpdateForm}
                        disabled={isPublishing}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {isPublishing ? (
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
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
                            deleteForm(selectedFormId).then(() => {
                              router.push('/');
                            }).catch((err) => {
                              setError('Failed to delete form. Please try again.');
                            });
                          }
                        }}
                        className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                      >
                        Delete Form
                      </button>
                    </div>
                  ) : (
                    // Create mode - Show Publish button
                    <button
                      onClick={handlePublish}
                      disabled={isPublishing}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isPublishing ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Publishing Form...
                        </span>
                      ) : (
                        'Publish Form'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Theme Settings Card */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Theme Settings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                    <input
                      type="text"
                      value={themeBackground}
                      onChange={e => setThemeBackground(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g. #1e2761"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={textColor}
                        onChange={e => setTextColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      <span className="text-sm text-gray-500">Preview</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={e => setAccentColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                      />
                      <span className="text-sm text-gray-500">Preview</span>
                    </div>
                  </div>
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
