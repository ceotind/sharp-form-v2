'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, updateDoc, query, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Form, FormField } from '@/types/form';
import { FormBuilder } from '@/components/FormBuilder';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { GripVertical, Pencil, Trash2, UserCircle } from 'lucide-react';
import { SortableField } from '@/components/SortableField';

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

    if (fields.length === 0) {
      setError('Please add at least one field to your form');
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      // Verify Firebase is initialized
      if (!db) {
        throw new Error('Firebase is not initialized');
      }

      // Clean up fields to remove undefined values
      const cleanedFields = fields.map(field => {
        const baseField = {
          id: field.id,
          type: field.type,
          label: field.label,
          required: field.required,
          ...(field.placeholder && { placeholder: field.placeholder }),
          ...(field.helpText && { helpText: field.helpText })
        };

        switch (field.type) {
          case 'text':
            return {
              ...baseField,
              ...(field.minLength && { minLength: field.minLength }),
              ...(field.maxLength && { maxLength: field.maxLength }),
              ...(field.pattern && { pattern: field.pattern })
            };
          case 'textarea':
            return {
              ...baseField,
              ...(field.minLength && { minLength: field.minLength }),
              ...(field.maxLength && { maxLength: field.maxLength }),
              rows: field.rows || 3
            };
          case 'dropdown':
            return {
              ...baseField,
              options: field.options || [],
              multiple: field.multiple || false
            };
          case 'checkbox':
            return {
              ...baseField,
              checked: field.checked || false
            };
          case 'radio':
            return {
              ...baseField,
              options: field.options || []
            };
          case 'date':
            return {
              ...baseField,
              ...(field.min && { min: field.min }),
              ...(field.max && { max: field.max })
            };
          default:
            return baseField;
        }
      });

      const formData = {
        title: formTitle.trim(),
        ...(formDescription.trim() && { description: formDescription.trim() }),
        fields: cleanedFields,
        createdAt: new Date(),
        updatedAt: new Date(),
        published: true,
        createdBy: 'anonymous', // TODO: Replace with actual user ID when auth is implemented
        settings: {
          allowMultipleResponses: true,
          customSuccessMessage: 'Thank you for your submission!',
          customErrorMessage: 'There was an error submitting your form. Please try again.',
          themeBackground,
          textColor,
          accentColor
        }
      };

      const docRef = await addDoc(collection(db, 'forms'), formData);
      router.push(`/forms/${docRef.id}`);
    } catch (err) {
      console.error('Error publishing form:', err);
      if (err instanceof Error) {
        setError(`Failed to publish form: ${err.message}`);
      } else {
        setError('Failed to publish form. Please check your Firebase configuration and try again.');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleThemeSave = async () => {
    setThemeSaving(true);
    setThemeSaveMsg('');
    try {
      await updateDoc(doc(db, 'forms', docRef.id), {
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 shadow-lg flex flex-col z-20 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">S</div>
            <span className="font-bold text-xl text-gray-900">SharpForm</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-700 font-medium transition-all hover:bg-blue-100">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"/></svg>
            Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-medium transition-all hover:bg-gray-50">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
            Forms
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-medium transition-all hover:bg-gray-50">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M12 4h9"/><path d="M4 9h16"/><path d="M4 15h16"/></svg>
            Settings
          </button>
        </nav>
        {/* Your Forms Section */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 mt-2">Your Forms</h3>
          {forms.length === 0 && <div className="text-gray-400 text-sm">No forms yet</div>}
          <ul className="space-y-1">
            {forms.map(form => (
              <li key={form.id} className="flex items-center justify-between group bg-gray-50 hover:bg-blue-50 rounded-lg px-3 py-2 transition">
                <div className="flex-1 min-w-0">
                  <span className="block truncate text-sm font-medium text-gray-900">{form.title || 'Untitled'}</span>
                  <span className="block truncate text-xs text-gray-500">{form.description || 'No description'}</span>
                </div>
                <div className="flex items-center gap-1 ml-2 opacity-80 group-hover:opacity-100">
                  {/* View Icon */}
                  <button title="View" onClick={() => router.push(`/forms/${form.id}`)} className="p-1 hover:bg-blue-100 rounded">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  {/* Edit Icon */}
                  <button 
                    title="Edit" 
                    onClick={() => handleEditForm(form.id)} 
                    className="p-1 hover:bg-yellow-100 rounded"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19.5 3 21l1.5-4L16.5 3.5z"/>
                    </svg>
                  </button>
                  {/* Delete Icon */}
                  <button title="Delete" onClick={async () => { await deleteForm(form.id); }} className="p-1 hover:bg-red-100 rounded">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/></svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 font-medium transition-all hover:bg-gray-50">
            <UserCircle className="w-6 h-6" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-0">
        {/* Mobile menu button */}
        <button 
          className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-white shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        {/* Main content with 2 equal columns */}
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
                    <div className="relative">
                      <input
                        type="text"
                        id="title"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Form Title"
                      />
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mt-2">
                        Form Title <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="relative">
                      <textarea
                        id="description"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        placeholder="Form Description"
                        rows={3}
                      />
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mt-2">
                        Form Description
                      </label>
                    </div>
                  </div>
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isPublishing ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Publishing...
                      </span>
                    ) : (
                      'Publish Form'
                    )}
                  </button>
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
      </div>
    </div>
  );
}
