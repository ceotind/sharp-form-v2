import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FormField, FieldType, TextField, TextareaField, DropdownField, CheckboxField, RadioField, DateField } from '@/types/form';
import { formElementRegistry } from './registry/FormElementRegistry';
import { SortableField } from './SortableField';
import { FormElementEditor } from './FormElementEditor';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface FormBuilderProps {
  fields?: FormField[];
  initialFields?: FormField[];
  onChange?: (fields: FormField[]) => void;
  onFieldSelect?: (field: FormField) => void;
  selectedFieldId?: string | null;
  editingField?: FormField | null;
  onFieldUpdate?: (updatedField: FormField) => void;
  className?: string;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  fields: externalFields = [],
  initialFields = [],
  onChange,
  onFieldSelect,
  selectedFieldId,
  editingField = null,
  onFieldUpdate,
  className = '',
}) => {
  const [fields, setFields] = useState<FormField[]>(initialFields.length > 0 ? initialFields : externalFields);
  const [availableElements] = useState(() => formElementRegistry.getAll());
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  // Find the field being edited
  const fieldBeingEdited = editingFieldId ? fields.find(f => f.id === editingFieldId) || null : null;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setFields(externalFields);
  }, [externalFields]);

  const handleAddField = (type: FieldType) => {
    const baseField = {
      id: `field-${Date.now()}`,
      label: formElementRegistry.getConfig(type)?.name || `New ${type}`,
      type,
      required: false,
      description: '',
      helpText: '',
      placeholder: '',
      defaultValue: undefined,
      ...formElementRegistry.getConfig(type)?.defaultOptions,
    };

    let newField: FormField;

    switch (type) {
      case 'text':
      case 'email':
      case 'url':
      case 'tel':
      case 'number':
        newField = {
          ...baseField,
          type,
        } as TextField;
        break;

      case 'textarea':
        newField = {
          ...baseField,
          type: 'textarea',
          rows: 3,
        } as TextareaField;
        break;

      case 'dropdown':
        newField = {
          ...baseField,
          type: 'dropdown',
          options: [
            { id: '1', label: 'Option 1', value: 'option1' },
            { id: '2', label: 'Option 2', value: 'option2' },
          ],
          multiple: false,
        } as DropdownField;
        break;

      case 'checkbox':
        newField = {
          ...baseField,
          type: 'checkbox',
          checked: false,
        } as CheckboxField;
        break;

      case 'radio':
        newField = {
          ...baseField,
          type: 'radio',
          options: [
            { id: '1', label: 'Option 1', value: 'option1' },
            { id: '2', label: 'Option 2', value: 'option2' },
          ],
        } as RadioField;
        break;

      case 'date':
        newField = {
          ...baseField,
          type: 'date',
        } as DateField;
        break;

      default:
        // This should never happen as we only allow valid field types
        throw new Error(`Invalid field type: ${type}`);
    }

    const newFields = [...fields, newField];
    setFields(newFields);
    onChange?.(newFields);
    onFieldSelect?.(newField);
    setEditingFieldId(newField.id); // Open editor for the new field
  };

  const handleUpdateField = (id: string, updates: Record<string, any>) => {
    const newFields = fields.map((field) =>
      field.id === id ? { ...field, ...updates } : field
    );
    setFields(newFields);
    onChange?.(newFields);
  };

  const handleDeleteField = (id: string) => {
    const newFields = fields.filter((field) => field.id !== id);
    setFields(newFields);
    onChange?.(newFields);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newFields = arrayMove(items, oldIndex, newIndex);
        onChange?.(newFields);
        return newFields;
      });
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {availableElements.map((element) => (
          <button
            key={element.type}
            type="button"
            onClick={() => handleAddField(element.type as FieldType)}
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="w-8 h-8 flex items-center justify-center text-blue-600 mb-2">
              {element.config.icon}
            </div>
            <span className="text-sm font-medium text-gray-700">{element.config.name}</span>
          </button>
        ))}
      </div>

      {/* Main form builder area */}
      <div className="flex-1 p-6 overflow-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((field) => field.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {fields.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">Drag form elements here or click on an element in the sidebar</p>
                </div>
              ) : (
                fields.map((field) => (
                  <SortableField
                    key={field.id}
                    field={field}
                    isSelected={selectedFieldId === field.id}
                    onSelect={() => onFieldSelect?.(field)}
                    onUpdate={(updates) => handleUpdateField(field.id, updates)}
                    onDelete={() => handleDeleteField(field.id)}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <FormElementEditor
        field={fieldBeingEdited}
        onClose={() => setEditingFieldId(null)}
        onUpdate={(updates) => {
          if (fieldBeingEdited) {
            handleUpdateField(fieldBeingEdited.id, updates);
          }
        }}
      />
    </div>
  );
};

export default FormBuilder;
