import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { FormField, FieldType } from '@/types/form';
import { FieldEditor } from './FieldEditor';
import { SortableField } from './SortableField';

interface FormBuilderProps {
  initialFields?: FormField[];
  onChange?: (fields: FormField[]) => void;
  editingField?: FormField | null;
  onFieldUpdate?: (field: FormField) => void;
}

export function FormBuilder({ 
  initialFields = [], 
  onChange,
  editingField: externalEditingField,
  onFieldUpdate
}: FormBuilderProps) {
  const createNewField = (type: FieldType): FormField => {
    const baseField = {
      id: crypto.randomUUID(),
      type,
      label: `New ${type} field`,
      required: false,
    };

    switch (type) {
      case 'dropdown':
      case 'radio':
        return {
          ...baseField,
          type,
          options: [{ id: crypto.randomUUID(), label: 'Option 1', value: 'option1' }],
        };
      case 'checkbox':
        return {
          ...baseField,
          type,
          checked: false,
        };
      case 'text':
        return {
          ...baseField,
          type,
          minLength: undefined,
          maxLength: undefined,
          pattern: undefined,
        };
      case 'textarea':
        return {
          ...baseField,
          type,
          minLength: undefined,
          maxLength: undefined,
          rows: 3,
        };
      case 'date':
        return {
          ...baseField,
          type,
          min: undefined,
          max: undefined,
        };
    }
  };

  const addField = (type: FieldType) => {
    const newField = createNewField(type);
    onChange?.([...initialFields, newField]);
  };

  const updateField = (updatedField: FormField) => {
    if (onFieldUpdate) {
      onFieldUpdate(updatedField);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Add Field</h2>
        <div className="flex flex-wrap gap-2">
          {(['text', 'textarea', 'dropdown', 'checkbox', 'radio', 'date'] as FieldType[]).map(
            (type) => (
              <button
                key={type}
                onClick={() => addField(type)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                Add {type}
              </button>
            )
          )}
        </div>
      </div>

      <AnimatePresence>
        {externalEditingField && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <FieldEditor
              field={externalEditingField}
              onSave={updateField}
              onCancel={() => onFieldUpdate?.(externalEditingField)}
              onDelete={() => {
                onChange?.(initialFields.filter(f => f.id !== externalEditingField.id));
                onFieldUpdate?.(externalEditingField);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 