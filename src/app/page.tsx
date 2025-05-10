'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, FORMS_COLLECTION } from '@/lib/firebase';
import { doc, setDoc, collection, query, orderBy, onSnapshot, deleteDoc, updateDoc, where, getDocs } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { FormField } from '@/types/form';
import { FormHeader } from '@/components/form-builder/FormHeader';
import { FormPreview } from '@/components/form-builder/FormPreview';
import { FormProperties } from '@/components/form-builder/FormProperties';
import { FormTheme } from '@/components/form-builder/FormTheme';
import { FormElements } from '@/components/form-builder/FormElements';
import { ShareDialog } from '@/components/form-builder/ShareDialog';
import { Sidebar } from '@/components/form-builder/Sidebar';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';
import debounce from 'lodash/debounce';

export default function CreateFormPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('Untitled Form');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
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

  // Custom URL state
  const [customSlug, setCustomSlug] = useState('');
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean>(true);

  useEffect(() => {
    const q = query(collection(db, FORMS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const formsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setForms(formsList);
    });
    return () => unsubscribe();
  }, []);

  // Check if the custom slug is available
  const checkSlugAvailability = async (slug: string) => {
    if (!slug) {
      setIsSlugAvailable(true);
      return;
    }

    try {
      const q = query(collection(db, FORMS_COLLECTION), where('customSlug', '==', slug));
      const snapshot = await getDocs(q);
      
      // If there are no documents with this slug, or the only document is the current form
      const isAvailable = snapshot.empty || 
        (snapshot.size === 1 && snapshot.docs[0].id === selectedFormId);
      
      setIsSlugAvailable(isAvailable);
    } catch (error) {
      console.error('Error checking slug availability:', error);
      setIsSlugAvailable(false);
    }
  };

  // Debounced version of the slug checker
  const debouncedCheckSlug = debounce(checkSlugAvailability, 500);

  // Helper to generate a share link
  const generateShareLink = (formId: string): string => {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/forms/${formId}`;
  };

  // Helper to get response count badge color
  const getResponseBadgeColor = (count: number): string => {
    if (count === 0) return 'bg-gray-100 text-gray-500';
    if (count < 10) return 'bg-blue-100 text-blue-700';
    if (count < 50) return 'bg-green-100 text-green-700';
    return 'bg-purple-100 text-purple-700';
  };

  // Update field
  const handleFieldUpdate = (updatedField: FormField) => {
    setFields(prev => prev.map(field => 
      field.id === updatedField.id ? updatedField : field
    ));
  };

  // Handle field selection for adding new fields
  const handleFieldSelect = (fieldType: string) => {
    const baseField = {
      id: uuidv4(),
      label: `New ${fieldType} field`,
      description: `Enter description for this ${fieldType} field`,
      helpText: `Help text for ${fieldType} field`,
      required: false,
      placeholder: `Enter ${fieldType} value here`,
      defaultValue: '',
      validation: {
        required: false,
        pattern: '',
        minLength: 0,
        maxLength: 100
      }
    };

    let newField: FormField;
    switch (fieldType) {
      case 'text':
      case 'email':
      case 'url':
      case 'tel':
      case 'number':
        newField = {
          ...baseField,
          type: fieldType as "text" | "email" | "url" | "tel" | "number",
        };
        break;

      case 'textarea':
        newField = {
          ...baseField,
          type: 'textarea',
          rows: 3,
        };
        break;

      case 'dropdown':
        newField = {
          ...baseField,
          type: 'dropdown',
          options: [
            { id: uuidv4(), label: 'Option 1', value: 'option1' },
            { id: uuidv4(), label: 'Option 2', value: 'option2' }
          ],
          multiple: false,
        };
        break;

      case 'checkbox':
        newField = {
          ...baseField,
          type: 'checkbox',
          checked: false,
        };
        break;

      case 'radio':
        newField = {
          ...baseField,
          type: 'radio',
          options: [
            { id: uuidv4(), label: 'Option 1', value: 'option1' },
            { id: uuidv4(), label: 'Option 2', value: 'option2' }
          ],
        };
        break;

      case 'date':
        newField = {
          ...baseField,
          type: 'date',
        };
        break;

      default:
        throw new Error(`Unsupported field type: ${fieldType}`);
    }

    setFields(prev => [...prev, newField]);
  };

  // Handle edit form
  const handleEditForm = async (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (form) {
      setFormTitle(form.title);
      setFormDescription(form.description || '');
      setFields(form.fields);
      setCustomSlug(form.customSlug || '');
      if (form.settings) {
        setThemeBackground(form.settings.themeBackground || '');
        setTextColor(form.settings.textColor || '');
        setAccentColor(form.settings.accentColor || '');
      }
      setSelectedFormId(formId);
      await checkSlugAvailability(form.customSlug || '');
    }
  };

  // Handle form publishing
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

    if (customSlug && !isSlugAvailable) {
      setError('The custom URL is already taken');
      toast({
        title: "URL not available",
        description: "Please choose a different custom URL",
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const formId = uuidv4();
      const timestamp = new Date().toISOString();

      const formData = {
        id: formId,
        title: formTitle.trim(),
        createdAt: timestamp,
        updatedAt: timestamp,
        published: true,
        responseCount: 0,
        customSlug: customSlug || null,
        metadata: {
          lastModified: timestamp,
          created: timestamp,
          version: '1.0',
          platform: 'SharpForm'
        },
        description: formDescription.trim() || null,
        fields: fields,
        settings: {
          allowMultipleResponses: true,
          customSuccessMessage: 'Thank you for your submission!',
          customErrorMessage: 'There was an error submitting your form. Please try again.',
          themeBackground: themeBackground || '',
          textColor: textColor || '',
          accentColor: accentColor || ''
        }
      };

      // If there's a custom slug, create it in a separate collection for quick lookups
      if (customSlug) {
        await setDoc(doc(db, 'form_slugs', customSlug), {
          formId,
          createdAt: timestamp
        });
      }

      await setDoc(doc(db, FORMS_COLLECTION, formId), formData);
      
      toast({
        title: "Form published!", 
        description: "Your form has been published successfully",
        variant: "default"
      });
      
      router.push(customSlug ? `/forms/${customSlug}` : `/forms/${formId}`);
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

  // Handle form update
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

    if (customSlug && !isSlugAvailable) {
      setError('The custom URL is already taken');
      toast({
        title: "URL not available",
        description: "Please choose a different custom URL",
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
        customSlug: customSlug || null,
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

      // Update the form_slugs collection if needed
      const oldForm = forms.find(f => f.id === selectedFormId);
      if (oldForm?.customSlug !== customSlug) {
        if (oldForm?.customSlug) {
          // Delete old slug
          await deleteDoc(doc(db, 'form_slugs', oldForm.customSlug));
        }
        if (customSlug) {
          // Create new slug
          await setDoc(doc(db, 'form_slugs', customSlug), {
            formId: selectedFormId,
            createdAt: timestamp
          });
        }
      }

      await updateDoc(doc(db, FORMS_COLLECTION, selectedFormId), formData);
      
      toast({
        title: "Form updated", 
        description: "Your changes have been saved successfully",
        variant: "default"
      });
      
      router.push(customSlug ? `/forms/${customSlug}` : `/forms/${selectedFormId}`);
    } catch (err) {
      console.error('Error updating form:', err);
      setError('Failed to update form. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle theme save
  const handleThemeSave = async (formId: string) => {
    try {
      await updateDoc(doc(db, FORMS_COLLECTION, formId), {
        'settings.themeBackground': themeBackground,
        'settings.textColor': textColor,
        'settings.accentColor': accentColor,
      });
      sonnerToast.success('Theme updated!');
    } catch (e) {
      sonnerToast.error('Failed to update theme.');
    }
  };

  // Handle form deletion
  const deleteForm = async (id: string) => {
    try {
      await deleteDoc(doc(db, FORMS_COLLECTION, id));
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
  };

  // Handle share link copy
  const copyShareLink = () => {
    navigator.clipboard.writeText(currentShareLink);
    toast({
      title: "Link copied",
      description: "The form link has been copied to your clipboard.",
    });
  };

  // Handle share form dialog
  const handleShareForm = (formId: string) => {
    if (!formId) return;
    const shareLink = generateShareLink(formId);
    setCurrentShareLink(shareLink);
    setShareDialogOpen(true);
  };

  // Handle custom slug change
  const handleCustomSlugChange = (slug: string) => {
    setCustomSlug(slug);
    debouncedCheckSlug(slug);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-20">
        <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <Sidebar 
        forms={forms}
        selectedFormId={selectedFormId}
        sidebarOpen={sidebarOpen}
        onNewForm={() => {
          setFormTitle('Untitled Form');
          setFormDescription('');
          setFields([]);
          setThemeBackground('');
          setTextColor('');
          setAccentColor('');
          setSelectedFormId(null);
        }}
        onEditForm={handleEditForm}
        onDeleteForm={deleteForm}
        onViewForm={(id) => router.push(`/forms/${id}`)}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={`flex-1 transition-all duration-200 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <div className="container mx-auto px-4 py-8">
          <FormHeader 
            formTitle={formTitle}
            selectedFormId={selectedFormId}
            isPublishing={isPublishing}
            onPublish={handlePublish}
            onUpdate={handleUpdateForm}
            onView={(id) => router.push(`/forms/${id}`)}
            onShare={handleShareForm}
            onDelete={deleteForm}
          />

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">              <FormPreview 
                formTitle={formTitle}
                formDescription={formDescription}
                fields={fields}
                themeBackground={themeBackground}
                textColor={textColor}
                accentColor={accentColor}
                onFieldsChange={setFields}
                onFieldUpdate={handleFieldUpdate}
                onFieldEdit={(field) => {
                  // Open the field editor for this field
                  const editorElement = document.querySelector(`[data-field-id="${field.id}"]`);
                  if (editorElement) {
                    editorElement.scrollIntoView({ behavior: 'smooth' });
                  }
                  // Set the editing state and update the field
                  handleFieldUpdate(field);
                }}
                onFieldDelete={(id) => {
                  const field = fields.find(f => f.id === id);
                  if (field) {
                    const fieldType = field.type.charAt(0).toUpperCase() + field.type.slice(1);
                    setFields(fields.filter(f => f.id !== id));
                    toast({
                      title: "Field removed",
                      description: `${fieldType} field has been removed`,
                      variant: "default"
                    });
                  }
                }}
              />

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <FormProperties 
                  formTitle={formTitle}
                  formDescription={formDescription}
                  customSlug={customSlug}
                  onTitleChange={setFormTitle}
                  onDescriptionChange={setFormDescription}
                  onCustomSlugChange={handleCustomSlugChange}
                  isSlugAvailable={isSlugAvailable}
                />

                <FormTheme 
                  themeBackground={themeBackground}
                  textColor={textColor}
                  accentColor={accentColor}
                  onBackgroundChange={setThemeBackground}
                  onTextColorChange={setTextColor}
                  onAccentColorChange={setAccentColor}
                  onSave={() => handleThemeSave(selectedFormId!)}
                />
              </div>

              <FormElements 
                onFieldSelect={handleFieldSelect}
              />
            </div>
          </div>
        </div>
      </div>

      <ShareDialog 
        isOpen={shareDialogOpen}
        shareLink={currentShareLink}
        onClose={() => setShareDialogOpen(false)}
        onCopy={copyShareLink}
      />
    </div>
  );
}
