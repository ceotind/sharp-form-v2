import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FormField } from '@/types/form';
import { formElementRegistry } from './registry/FormElementRegistry';
import { SortableField } from './SortableField';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface FormBuilderProps {
  fields?: FormField[];
  onChange?: (fields: FormField[]) => void;
  onFieldSelect?: (field: FormField) => void;
  selectedFieldId?: string | null;
  className?: string;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  fields: externalFields = [],
  onChange,
  onFieldSelect,
  selectedFieldId,
  className = '',
}) => {
  const [fields, setFields] = useState<FormField[]>(externalFields);
  const [availableElements] = useState(() => formElementRegistry.getAll());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setFields(externalFields);
  }, [externalFields]);

  const handleAddField = (type: string) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: formElementRegistry.getConfig(type)?.name || `New ${type}`,
      ...formElementRegistry.getConfig(type)?.defaultOptions,
    };

    const newFields = [...fields, newField];
    setFields(newFields);
    onChange?.(newFields);
    onFieldSelect?.(newField);
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
            onClick={() => handleAddField(element.type)}
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
    </div>
  );
};

export default FormBuilder;
