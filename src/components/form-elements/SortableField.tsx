import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormField } from '@/types/form';
import { BaseFormElement } from './BaseFormElement';
import { PencilIcon, TrashIcon, ArrowsUpDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SortableFieldProps {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<FormField>) => void;
  onDelete: () => void;
}

export const SortableField: React.FC<SortableFieldProps> = ({
  field,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(field.label);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleLabelClick = (e: React.MouseEvent) => {
    if (!isEditing) {
      e.stopPropagation();
      setIsEditing(true);
    }
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedLabel(e.target.value);
  };

  const handleLabelBlur = () => {
    if (editedLabel.trim() && editedLabel !== field.label) {
      onUpdate({ label: editedLabel });
    } else {
      setEditedLabel(field.label);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelBlur();
    } else if (e.key === 'Escape') {
      setEditedLabel(field.label);
      setIsEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this field?')) {
      onDelete();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative p-4 border rounded-lg transition-colors ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      } ${isDragging ? 'shadow-lg z-10' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <ArrowsUpDownIcon className="w-4 h-4" />
        </button>

        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={editedLabel}
                onChange={handleLabelChange}
                onBlur={handleLabelBlur}
                onKeyDown={handleKeyDown}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLabelBlur();
                }}
                className="ml-2 p-1 text-green-600 hover:text-green-700"
              >
                <CheckIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditedLabel(field.label);
                  setIsEditing(false);
                }}
                className="ml-1 p-1 text-red-600 hover:text-red-700"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className="font-medium text-gray-900 cursor-text flex items-center"
              onClick={handleLabelClick}
            >
              {field.label}
              {field.required && <span className="ml-1 text-red-500">*</span>}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLabelClick(e);
                }}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              >
                <PencilIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="mt-2">
            <BaseFormElement
              element={field}
              value={field.defaultValue}
              onChange={() => {}}
              disabled={true}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
          aria-label="Delete field"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SortableField;
