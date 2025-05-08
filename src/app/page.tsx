'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { doc, setDoc, serverTimestamp, collection, query, orderBy, onSnapshot, deleteDoc, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { FormField, Form } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { FormBuilder } from '@/components/form-elements/FormBuilder';
import { SortableField } from '@/components/form-elements/SortableField';
import { Save, Plus, BarChart2, Eye, Edit, Trash, Share2, Copy, Menu, X, ChevronRight, Link, Settings, FileText, CheckSquare, Calendar, ToggleRight, AtSign, Hash, Film, FileImage, Clock, MessageSquare, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
// Import with dynamic import to resolve module issue
import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to avoid hydration issues
const FormBuilderLayout = dynamic(() => import('@/components/FormBuilderLayout'), { ssr: false });

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

// Helper to generate a share link
const generateShareLink = (formId: string): string => {
  // This will be the public-facing URL for filling forms
  return `${window.location.origin}/forms/${formId}/view`;
};

// Helper to get response count badge color
const getResponseBadgeColor = (count: number): string => {
  if (count === 0) return 'bg-gray-100 text-gray-500';
  if (count < 10) return 'bg-blue-100 text-blue-700';
  if (count < 50) return 'bg-green-100 text-green-700';
  return 'bg-purple-100 text-purple-700';
};

const FormItem = ({ form, onEdit, onDelete, onView, isActive }: { 
  form: any, 
  onEdit: () => void, 
  onDelete: () => void, 
  onView: () => void, 
  isActive: boolean 
}) => {
  const responseCount = form.responseCount || 0;
  const formDate = form.createdAt ? new Date(form.createdAt) : new Date();
  const formattedDate = formDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg mb-2 transition-colors ${isActive ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
      <div className="flex-1 truncate pr-2 max-w-[70%]">
        <h4 className="font-medium text-gray-900 truncate">{form.title || 'Untitled Form'}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">{formattedDate}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${getResponseBadgeColor(responseCount)}`}>
            {responseCount} {responseCount === 1 ? 'response' : 'responses'}
          </span>
        </div>
      </div>
      <div className="flex flex-shrink-0 gap-1 ml-auto">
        <Button variant="ghost" size="icon" onClick={onView} className="h-7 w-7 min-w-7 p-1" title="View Form">
          <Eye className="h-3.5 w-3.5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onEdit} className="h-7 w-7 min-w-7 p-1" title="Edit Form">
          <Edit className="h-3.5 w-3.5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onDelete} className="h-7 w-7 min-w-7 p-1 text-red-500 hover:text-red-600 hover:bg-red-50" title="Delete Form">
          <Trash className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

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
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [currentShareLink, setCurrentShareLink] = useState('');
  
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
    // Since we're already adding an ID when creating the field, we can use it directly
    setFields(prev => [...prev, field]);
    setEditingField(field);
    
    // Show success toast
    toast({
      title: `${field.type.charAt(0).toUpperCase() + field.type.slice(1)} field added`,
      description: "Field added to your form. You can now configure its properties.",
      variant: "default"
    });
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
      toast({
        title: "Missing title",
        description: "Please provide a title for your form before publishing",
        variant: "destructive"
      });
      return;
    }

    if (fields.length === 0) {
      setError('Your form needs at least one field');
      toast({
        title: "No form fields",
        description: "Please add at least one field to your form before publishing",
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const formId = uuidv4();
      const timestamp = new Date().toISOString();

      // Create form data with required fields
      const formData = {
        id: formId,
        title: formTitle.trim(),
        createdAt: timestamp,
        updatedAt: timestamp,
        published: true,
        responseCount: 0,
        metadata: {
          lastModified: timestamp,
          created: timestamp,
          version: '1.0',
          platform: 'SharpForm'
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
      
      toast({
        title: "Form published!", 
        description: "Your form has been published successfully",
        variant: "default"
      });
      
      router.push(`/forms/${formId}`);

    } catch (err) {
      console.error('Error creating form:', err);
      setError('Failed to create form. Please try again.');
      toast({
        title: "Error",
        description: "There was a problem publishing your form. Please try again.",
        variant: "destructive"
      });
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
    try {
      await deleteDoc(doc(db, 'forms', id));
      toast({
        title: "Form deleted",
        description: "The form has been permanently deleted",
      });
    } catch (error) {
      console.error('Error deleting form:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete the form. Please try again.",
        variant: "destructive"
      });
    }
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
      toast({
        title: "Missing title",
        description: "Please provide a title for your form before saving",
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const timestamp = new Date().toISOString();
      
      const formData = {
        title: formTitle.trim(),
        description: formDescription.trim() || '',
        fields: fields,
        updatedAt: timestamp,
        'metadata.lastModified': timestamp,
        settings: {
          allowMultipleResponses: true,
          customSuccessMessage: 'Thank you for your submission!',
          customErrorMessage: 'There was an error submitting your form. Please try again.',
          themeBackground: themeBackground || '',
          textColor: textColor || '',
          accentColor: accentColor || ''
        }
      };

      await updateDoc(doc(db, 'forms', selectedFormId), formData);
      
      toast({
        title: "Form updated", 
        description: "Your changes have been saved successfully",
        variant: "default"
      });
      
      router.push(`/forms/${selectedFormId}`);
    } catch (err) {
      console.error('Error updating form:', err);
      setError('Failed to update form. Please try again.');
      toast({
        title: "Error",
        description: "There was a problem saving your form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  }; // End of handleUpdateForm

  // Copy share link to clipboard
  const copyShareLink = () => {
    navigator.clipboard.writeText(currentShareLink);
    toast({
      title: "Link copied",
      description: "The form link has been copied to your clipboard.",
    });
  };

  // Generate and open share dialog
  const handleShareForm = (formId: string) => {
    if (!formId) return;
    const shareLink = generateShareLink(formId);
    setCurrentShareLink(shareLink);
    setShareDialogOpen(true);
  };

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-20">
        <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 bg-white w-64 shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out md:translate-x-0 z-10`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-indigo-600">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5" /> SharpForm
            </h2>
            <p className="text-sm text-blue-100">Advanced Form Builder</p>
          </div>
          
          <div className="p-4">
            <Button onClick={() => {
              setFormTitle('Untitled Form');
              setFormDescription('');
              setFields([]);
              setThemeBackground('');
              setTextColor('');
              setAccentColor('');
              setSelectedFormId(null);
              
              // Provide feedback
              toast({
                title: "New form started",
                description: "Add form elements and customize your new form",
              });
            }} 
            className="w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="h-4 w-4" /> New Form
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            {forms.length > 0 ? (
              forms.map((form) => (
                <FormItem
                  key={form.id}
                  form={form}
                  isActive={selectedFormId === form.id}
                  onEdit={() => handleEditForm(form.id)}
                  onDelete={() => {
                    if (window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
                      deleteForm(form.id);
                    }
                  }}
                  onView={() => router.push(`/forms/${form.id}`)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No forms yet</p>
                <p className="text-sm">Create your first form to get started</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-200 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            {/* Form Actions Bar */}
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">
                    {selectedFormId ? 'Edit Form' : 'Create New Form'}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {selectedFormId ? 'Making changes to an existing form' : 'Design a new form from scratch'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedFormId && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/forms/${selectedFormId}`)}
                      className="gap-2 hidden sm:flex"
                      size="sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden md:inline">View</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/forms/${selectedFormId}/responses`)}
                      className="gap-2 hidden sm:flex"
                      size="sm"
                    >
                      <BarChart2 className="w-4 h-4" />
                      <span className="hidden md:inline">Responses</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleShareForm(selectedFormId)}
                      className="gap-2"
                      size="sm"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="hidden md:inline">Share</span>
                    </Button>
                  </>
                )}
                <Button
                  onClick={selectedFormId ? handleUpdateForm : handlePublish}
                  disabled={isPublishing}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  size="sm"
                >
                  <Save className="w-4 h-4" />
                  {isPublishing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {selectedFormId ? 'Saving...' : 'Publishing...'}
                    </span>
                  ) : (selectedFormId ? 'Save Changes' : 'Publish Form')}
                </Button>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left Column - Form Preview */}
              <div className="space-y-6">
                {/* Form Preview Card */}
                <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Form Preview
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => {
                    if (fields.length > 0) {
                      router.push(selectedFormId ? `/forms/${selectedFormId}` : '#');
                    } else {
                      toast({
                        title: "No fields added",
                        description: "Add some fields to your form before previewing",
                        variant: "destructive"
                      });
                    }
                  }}>
                    <Eye className="w-4 h-4" /> <span className="hidden md:inline">Preview</span>
                  </Button>
                </CardTitle>
                <CardDescription>
                  Preview how your form will appear to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-hidden">
                  <div 
                    className="p-6 relative" 
                    style={{
                      background: themeBackground || 'white',
                      color: textColor || 'inherit'
                    }}
                  >
                    {themeBackground && <div className="absolute inset-0 opacity-5 bg-pattern-grid"></div>}
                    <div className="relative space-y-4">
                      <h3 className="text-2xl font-bold break-words leading-tight">
                        {formTitle || 'Untitled Form'}
                      </h3>
                      {formDescription && (
                        <p className="text-base opacity-80 break-words leading-relaxed">
                          {formDescription}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 p-4 rounded-b-lg">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext 
                        items={fields.map(f => f.id)} 
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-4">
                          {fields.length > 0 ? fields.map((field) => (
                            <SortableField
                              key={field.id}
                              field={field}
                              isSelected={editingField?.id === field.id}
                              onSelect={() => setEditingField(field)}
                              onUpdate={(updates: Partial<FormField>) => handleFieldUpdate({ ...field, ...updates })}
                              onDelete={() => {
                                setFields(prev => prev.filter(f => f.id !== field.id));
                                toast({
                                  title: "Field removed",
                                  description: `${field.type.charAt(0).toUpperCase() + field.type.slice(1)} field has been removed`,
                                  variant: "default"
                                });
                              }}
                            />
                          )) : (
                            <div className="text-center py-10 text-gray-500 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <FileText className="h-8 w-8 text-gray-400" />
                                <p className="font-medium">No form elements added yet</p>
                                <p className="text-sm">Use the form elements panel to add fields</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => document.getElementById('form-elements-section')?.scrollIntoView({ behavior: 'smooth' })}
                                  className="mt-2"
                                >
                                  Add Elements
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </SortableContext>
                    </DndContext>
                    
                    {fields.length > 0 && (
                      <div className="mt-6 flex justify-end">
                        <Button 
                          className="gap-2"
                          style={{ backgroundColor: accentColor || '#3b82f6', color: 'white' }}
                        >
                          <Save className="h-4 w-4" /> Submit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
                </Card>
              </div>
              
              {/* Right Column - Form Settings */}
              <div className="space-y-6">
                {/* Form Properties Card */}
                <Card>
              <CardHeader>
                <CardTitle>Form Properties</CardTitle>
                <CardDescription>Basic information about your form</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="font-medium">
                      Form Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full"
                      placeholder="Enter your form title"
                    />
                    <p className="text-xs text-gray-500">This will be displayed as the heading of your form</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-medium">
                      Form Description
                    </Label>
                    <textarea
                      id="description"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none min-h-[100px]"
                      placeholder="Enter a description for your form"
                    />
                    <p className="text-xs text-gray-500">Add context or instructions for form respondents</p>
                  </div>
                </div>
              </CardContent>
                </Card>

                {/* Form Elements Card */}
                <Card>
              <CardHeader>
                <CardTitle>Add Form Elements</CardTitle>
                <CardDescription>Drag and drop elements to build your form</CardDescription>
              </CardHeader>
              <CardContent>
                <div id="form-elements-section">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Click to add form elements:</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Button 
                      onClick={() => handleFieldSelect({ id: uuidv4(), type: 'text', label: 'Text Input', placeholder: 'Enter text...', required: false })}
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                    >
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">Text Input</span>
                    </Button>
                    
                    <Button 
                      onClick={() => handleFieldSelect({ id: uuidv4(), type: 'textarea', label: 'Textarea', placeholder: 'Enter your answer...', required: false, rows: 4 })}
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                    >
                      <MessageSquare className="h-5 w-5 text-indigo-600" />
                      <span className="text-sm font-medium">Long Text</span>
                    </Button>
                    
                    <Button 
                      onClick={() => handleFieldSelect({ 
                        id: uuidv4(),
                        type: 'dropdown', 
                        label: 'Dropdown', 
                        placeholder: 'Select an option', 
                        required: false,
                        options: [
                          { id: '1', label: 'Option 1', value: 'option1' },
                          { id: '2', label: 'Option 2', value: 'option2' },
                          { id: '3', label: 'Option 3', value: 'option3' },
                        ]
                      })}
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                    >
                      <ChevronRight className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Dropdown</span>
                    </Button>
                    
                    <Button 
                      onClick={() => handleFieldSelect({ 
                        id: uuidv4(),
                        type: 'checkbox', 
                        label: 'Checkbox', 
                        required: false,
                        checked: false
                      })}
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                    >
                      <CheckSquare className="h-5 w-5 text-amber-600" />
                      <span className="text-sm font-medium">Checkbox</span>
                    </Button>
                    
                    <Button 
                      onClick={() => handleFieldSelect({ 
                        id: uuidv4(),
                        type: 'radio', 
                        label: 'Radio Group', 
                        required: false,
                        options: [
                          { id: '1', label: 'Option 1', value: 'option1' },
                          { id: '2', label: 'Option 2', value: 'option2' },
                          { id: '3', label: 'Option 3', value: 'option3' },
                        ]
                      })}
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                    >
                      <ToggleRight className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium">Radio Group</span>
                    </Button>
                    
                    <Button 
                      onClick={() => handleFieldSelect({ 
                        id: uuidv4(),
                        type: 'date', 
                        label: 'Date Input', 
                        required: false
                      })}
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                    >
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium">Date</span>
                    </Button>
                    
                    <Button 
                      onClick={() => handleFieldSelect({ 
                        id: uuidv4(),
                        type: 'email', 
                        label: 'Email', 
                        placeholder: 'Enter email address', 
                        required: false 
                      })}
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                    >
                      <AtSign className="h-5 w-5 text-cyan-600" />
                      <span className="text-sm font-medium">Email</span>
                    </Button>
                    
                    <Button 
                      onClick={() => handleFieldSelect({ 
                        id: uuidv4(),
                        type: 'number', 
                        label: 'Number Input', 
                        placeholder: 'Enter a number', 
                        required: false 
                      })}
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                    >
                      <Hash className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm font-medium">Number</span>
                    </Button>
                    
                    <Button 
                      onClick={() => handleFieldSelect({ 
                        id: uuidv4(),
                        type: 'file', 
                        label: 'File Upload', 
                        required: false,
                        accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png'
                      })}
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                    >
                      <FileImage className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium">File Upload</span>
                    </Button>
                  </div>
                  
                  <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                    <p className="text-xs text-amber-800 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>Authentication features will be added in a future update to provide user-specific form management.</span>
                    </p>
                  </div>
                </div>
              </CardContent>
                </Card>

                {/* Theme Settings Card */}
                <Card id="form-theme-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-muted-foreground" /> Form Theme
                </CardTitle>
                <CardDescription>Customize the appearance of your form</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    <div className="space-y-2">
                      <Label className="font-medium">Background</Label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={themeBackground}
                          onChange={e => setThemeBackground(e.target.value)}
                          className="w-full"
                          placeholder="e.g. #1e2761 or linear-gradient(...)"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="shrink-0"
                          onClick={() => setThemeBackground('#f8fafc')}
                          title="Reset to default"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2 mt-1">
                        {['#ffffff', '#f1f5f9', '#e0f2fe', '#f0fdf4', '#fef2f2'].map(color => (
                          <Button 
                            key={color}
                            variant="outline" 
                            size="icon"
                            className="h-6 w-6 p-0 rounded-full"
                            style={{ backgroundColor: color }}
                            onClick={() => setThemeBackground(color)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Text Color</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={textColor}
                          onChange={e => setTextColor(e.target.value)}
                          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                        />
                        <div 
                          className="w-8 h-8 rounded-full border shadow-sm" 
                          style={{ backgroundColor: textColor || '#000000' }}
                        ></div>
                      </div>
                      <div className="flex gap-2 mt-1">
                        {['#000000', '#334155', '#1e40af', '#047857', '#b91c1c'].map(color => (
                          <Button 
                            key={color}
                            variant="outline" 
                            size="icon"
                            className="h-6 w-6 p-0 rounded-full"
                            style={{ backgroundColor: color }}
                            onClick={() => setTextColor(color)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Accent Color</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={e => setAccentColor(e.target.value)}
                          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                        />
                        <div 
                          className="w-8 h-8 rounded-full border shadow-sm" 
                          style={{ backgroundColor: accentColor || '#3b82f6' }}
                        ></div>
                      </div>
                      <div className="flex gap-2 mt-1">
                        {['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'].map(color => (
                          <Button 
                            key={color}
                            variant="outline" 
                            size="icon"
                            className="h-6 w-6 p-0 rounded-full"
                            style={{ backgroundColor: color }}
                            onClick={() => setAccentColor(color)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5" /> Theme Preview
                        </h4>
                        <p className="text-xs text-gray-500">How your form's colors will appear to users</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (selectedFormId) {
                            handleThemeSave(selectedFormId);
                          } else {
                            toast({
                              title: "Save form first",
                              description: "Please save your form before applying theme changes"
                            });
                          }
                        }}
                        disabled={themeSaving}
                        className="gap-1.5"
                      >
                        {themeSaving ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg> Applying...
                          </>
                        ) : 'Apply Theme'}
                      </Button>
                    </div>
                    <div className="mt-3 rounded-md overflow-hidden border shadow-sm">
                      <div 
                        className="p-3" 
                        style={{ 
                          backgroundColor: themeBackground || 'white',
                          color: textColor || 'black'
                        }}
                      >
                        <p className="text-sm font-medium">Form Header</p>
                        <p className="text-xs">Form description text</p>
                      </div>
                      <div className="bg-white border-t p-3">
                        <Button 
                          size="sm"
                          className="mt-2"
                          style={{ backgroundColor: accentColor || '#3b82f6' }}
                        >
                          Submit Button
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Share Link Dialog */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Form</DialogTitle>
                  <DialogDescription>
                    Anyone with this link can fill your form, but cannot edit it.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    value={currentShareLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button size="icon" variant="outline" onClick={copyShareLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <DialogFooter className="mt-4">
                  <Button variant="secondary" onClick={() => setShareDialogOpen(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
        </div>
      </div>
    </div>
  );
}
