'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { doc, setDoc, serverTimestamp, collection, query, orderBy, onSnapshot, deleteDoc, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { FormField } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { FormBuilder } from '@/components/form-elements/FormBuilder';
import { SortableField } from '@/components/form-elements/SortableField';
import { Save, Plus, BarChart2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import FormBuilderLayout from '@/components/FormBuilderLayout';

// Import form elements to register them
import '@/components/form-elements/elements/TextInput';
import '@/components/form-elements/elements/TextareaInput';
import '@/components/form-elements/elements/SelectInput';
import '@/components/form-elements/elements/CheckboxInput';
import '@/components/form-elements/elements/RadioGroup';
import '@/components/form-elements/elements/DateInput';

// Your web app's Firebase configuration
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function CreateFormPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('Untitled Form');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [forms, setForms] = useState<any[]>([]);

  // Theme state
  const [themeBackground, setThemeBackground] = useState('');
  const [textColor, setTextColor] = useState('');
  const [accentColor, setAccentColor] = useState('');
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeSaveMsg, setThemeSaveMsg] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const q = query(collection(db, 'forms'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const formsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setForms(formsList);
    });
    return () => unsubscribe();
  }, []);

  // Handle drag and drop for fields
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Handle field changes from FormBuilder
  const handleFieldsChange = (newFields: FormField[]) => {
    setFields(newFields);
  };

  // Handle field selection
  const handleFieldSelect = (field: FormField) => {
    setEditingField(field);
  };

  // Update field
  const handleFieldUpdate = (updatedField: FormField) => {
    setFields(prev => prev.map(field => 
      field.id === updatedField.id ? updatedField : field
    ));
    setEditingField(null);
  };

  // Publish form
  const handlePublish = async () => {
    if (!formTitle.trim()) {
      setError('Please enter a form title');
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const formId = uuidv4();

      // Create form data with required fields
      const formData = {
        id: formId,
        title: formTitle.trim(),
        createdAt: new Date().toISOString(), // Use ISO string for consistent date format
        ipAddress: '', // Placeholder, set actual IP if needed
        metadata: {  // Add metadata object for tracking
          lastModified: new Date().toISOString(),
          created: new Date().toISOString(),
          creatorIp: ''
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

      // Save to Firebase
      await setDoc(doc(db, 'forms', formId), formData);
      
      router.push(`/forms/${formId}`);

    } catch (err) {
      console.error('Error creating form:', err);
      setError('Failed to create form. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Save theme settings
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
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Form Preview Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h1 className="text-2xl font-bold">Form Preview</h1>
              <div className="flex gap-2">
                {selectedFormId && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/forms/${selectedFormId}`)}
                      className="gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M2 12s3-7.5 10-7.5 10 7.5 10 7.5-3 7.5-10 7.5-10-7.5-10-7.5z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      View Form
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/forms/${selectedFormId}/responses`)}
                      className="gap-2"
                    >
                      <BarChart2 className="w-4 h-4" />
                      View Responses
                    </Button>
                  </>
                )}
                <Button
                  onClick={selectedFormId ? handleUpdateForm : handlePublish}
                  disabled={isPublishing}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isPublishing ? 'Saving...' : (selectedFormId ? 'Save Changes' : 'Publish Form')}
                </Button>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-lg border border-gray-200">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900 break-words leading-tight">
                      {formTitle || 'Untitled Form'}
                    </h3>
                    {formDescription && (
                      <p className="text-gray-600 text-base break-words leading-relaxed">
                        {formDescription}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  {fields.map((field) => (
                    <SortableField
                      key={field.id}
                      field={field}
                      isSelected={editingField?.id === field.id}
                      onSelect={() => setEditingField(field)}
                      onUpdate={(updates: Partial<FormField>) => handleFieldUpdate({ ...field, ...updates })}
                      onDelete={() => setFields(prev => prev.filter(f => f.id !== field.id))}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Elements Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Form Elements</h2>
              <div className="space-y-4">
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
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">Add context or instructions for form respondents</p>
                </div>
              </div>
            </div>

            {/* Form Elements Grid */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Add Form Elements</h2>
              <FormBuilder
                fields={[]}
                onChange={() => {}}
                onFieldSelect={handleFieldSelect}
                selectedFieldId={editingField?.id}
                className="p-4 bg-gray-50 rounded-lg"
              />
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
          </div>
        </div>
      </div>
    </FormBuilderLayout>
  );
}
