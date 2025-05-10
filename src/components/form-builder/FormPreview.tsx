import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { FormField } from "@/types/form";
import { FormElementEditor } from './FormElementEditor';
import { Edit2, Trash2 } from 'lucide-react';
import { useState } from "react";

interface FormPreviewProps {
  formTitle: string;
  formDescription: string;
  fields: FormField[];
  themeBackground: string;
  textColor: string;
  accentColor: string;
  onFieldsChange: (fields: FormField[]) => void;
  onFieldUpdate: (field: FormField) => void;
  onFieldEdit: (field: FormField) => void;
  onFieldDelete: (id: string) => void;
}

export function FormPreview({
  formTitle,
  formDescription,
  fields,
  themeBackground,
  textColor,
  accentColor,
  onFieldsChange,
  onFieldUpdate,
  onFieldEdit,
  onFieldDelete
}: FormPreviewProps) {
  const [editingField, setEditingField] = useState<FormField | null>(null);

  // Handle field editing
  const handleEditClick = (field: FormField) => {
    setEditingField(field);
  };

  const handleFieldSave = (updatedField: FormField) => {
    onFieldUpdate(updatedField);
    setEditingField(null);
  };

  const renderFieldActions = (field: FormField) => {
    return (
      <div className="absolute right-2 top-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleEditClick(field);
          }}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFieldDelete(field.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderField = (field: FormField) => {
    const baseInputClasses = `
      block w-full rounded-lg border border-gray-300
      px-3 py-2 text-gray-900 shadow-sm focus:ring-2
      focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 
      disabled:text-gray-500 transition-colors
    `;

    const baseRadioCheckboxClasses = `
      h-4 w-4 border-gray-300 focus:ring-2 focus:ring-blue-500 
      text-blue-600 disabled:opacity-50 transition-colors
    `;

    const renderLabel = () => (
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-900">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {field.description && (
          <p className="mt-1 text-sm text-gray-500">{field.description}</p>
        )}
      </div>
    );

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
      case 'number':
        return (
          <>
            {renderLabel()}
            <input
              type={field.type}
              placeholder={field.placeholder}
              className={baseInputClasses}
              disabled
            />
          </>
        );

      case 'textarea':
        return (
          <>
            {renderLabel()}
            <textarea
              placeholder={field.placeholder}
              rows={field.rows || 4}
              className={baseInputClasses}
              disabled
            />
          </>
        );

      case 'dropdown':
        return (
          <>
            {renderLabel()}
            <select className={baseInputClasses} disabled>
              <option value="">{field.placeholder || 'Select an option'}</option>
              {field.options?.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </>
        );

      case 'checkbox':
        if (field.options && field.options.length > 0) {
          return (
            <>
              {renderLabel()}
              <div className="space-y-2">
                {field.options.map((option) => (
                  <div key={option.id} className="flex items-center">
                    <input
                      type="checkbox"
                      className={`${baseRadioCheckboxClasses} rounded`}
                      disabled
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </>
          );
        } else {
          return (
            <div className="flex items-center">
              <input
                type="checkbox"
                className={`${baseRadioCheckboxClasses} rounded`}
                disabled
              />
              <label className="ml-2 block text-sm text-gray-900">
                {field.label}
              </label>
            </div>
          );
        }

      case 'radio':
        return (
          <>
            {renderLabel()}
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option.id} className="flex items-center">
                  <input
                    type="radio"
                    className={`${baseRadioCheckboxClasses} rounded-full`}
                    disabled
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </>
        );

      case 'date':
        return (
          <>
            {renderLabel()}
            <input
              type="date"
              className={baseInputClasses}
              disabled
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Form Preview
          <Button variant="ghost" size="sm" className="gap-1">
            <Eye className="w-4 h-4" /> 
            <span className="hidden md:inline">Preview</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="p-6 rounded-lg min-h-[500px]"
          style={{
            backgroundColor: themeBackground || 'white',
            color: textColor || 'inherit'
          }}
        >
          <h1 className="text-2xl font-bold mb-2">{formTitle}</h1>
          {formDescription && (
            <p className="text-sm text-gray-600 mb-6">{formDescription}</p>
          )}
          
          <DndContext 
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
          >
            <SortableContext 
              items={fields.map(f => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field) => (
                <div
                  key={field.id}
                  className="relative group mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                  {renderField(field)}
                  {renderFieldActions(field)}
                </div>
              ))}
            </SortableContext>
          </DndContext>

          {fields.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Add form elements from the panel on the right</p>
            </div>
          )}
        </div>
      </CardContent>

      {editingField && (
        <FormElementEditor
          isOpen={!!editingField}
          onClose={() => setEditingField(null)}
          field={editingField}
          onSave={handleFieldSave}
        />
      )}
    </Card>
  );

  function handleDragEnd(event: any) {
    const {active, over} = event;
    
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex(f => f.id === active.id);
      const newIndex = fields.findIndex(f => f.id === over.id);
      
      const newFields = [...fields];
      const [movedItem] = newFields.splice(oldIndex, 1);
      newFields.splice(newIndex, 0, movedItem);
      
      onFieldsChange(newFields);
    }
  }
}