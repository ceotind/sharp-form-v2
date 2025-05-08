import { useState } from 'react';
import { motion } from 'framer-motion';
import { FormField, FieldType } from '@/types/form';

interface FieldEditorProps {
  field: FormField;
  onSave: (field: FormField) => void;
  onCancel: () => void;
  onDelete: () => void;
}

export function FieldEditor({ field, onSave, onCancel, onDelete }: FieldEditorProps) {
  const [editedField, setEditedField] = useState<FormField>(field);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editedField.label.trim()) {
      newErrors.label = 'Label is required';
    }

    if ('options' in editedField) {
      if (editedField.options.length === 0) {
        newErrors.options = 'At least one option is required';
      } else {
        editedField.options.forEach((option: { label: string; value: string; id: string }, index: number) => {
          if (!option.label.trim()) {
            newErrors[`option-${index}-label`] = 'Option label is required';
          }
          if (!option.value.trim()) {
            newErrors[`option-${index}-value`] = 'Option value is required';
          }
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (key: string, value: any) => {
    setEditedField(prev => ({ ...prev, [key]: value }));
    // Clear error when field is edited
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleOptionChange = (index: number, key: string, value: string) => {
    if ('options' in editedField) {
      const newOptions = [...editedField.options];
      newOptions[index] = { ...newOptions[index], [key]: value };
      setEditedField(prev => ({ ...prev, options: newOptions }));
      // Clear errors for this option
      setErrors(prev => ({
        ...prev,
        [`option-${index}-label`]: '',
        [`option-${index}-value`]: '',
      }));
    }
  };

  const addOption = () => {
    if ('options' in editedField) {
      const newOption = {
        id: crypto.randomUUID(),
        label: '',
        value: ''
      };
      setEditedField(prev => ({
        ...prev,
        options: [...(prev as any).options, newOption]
      }));
    }
  };

  const removeOption = (index: number) => {
    if ('options' in editedField) {
      const newOptions = editedField.options.filter((_: any, i: number) => i !== index);
      setEditedField(prev => ({ ...prev, options: newOptions }));
    }
  };

  const handleSave = () => {
    if (validateField()) {
      onSave(editedField);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-8 bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">Edit Field</h2>
          <button
            onClick={onDelete}
            className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors font-medium"
          >
            Delete Field
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editedField.label}
              onChange={(e) => handleChange('label', e.target.value)}
              placeholder="Enter field label"
              className={`mt-1 block w-full px-4 py-2.5 rounded-lg border shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base
                ${errors.label ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}`}
            />
            {errors.label && (
              <p className="mt-2 text-sm text-red-600">{errors.label}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placeholder
            </label>
            <input
              type="text"
              value={editedField.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              placeholder="Enter placeholder text"
              className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Help Text
            </label>
            <input
              type="text"
              value={editedField.helpText || ''}
              onChange={(e) => handleChange('helpText', e.target.value)}
              placeholder="Enter help text"
              className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white"
            />
          </div>

          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={editedField.required}
              onChange={(e) => handleChange('required', e.target.checked)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-3 block text-sm font-medium text-gray-700">Required field</label>
          </div>

          {'options' in editedField && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Options <span className="text-red-500">*</span>
                </label>
                <button
                  onClick={addOption}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Add Option
                </button>
              </div>
              {errors.options && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{errors.options}</p>
              )}
              <div className="space-y-3">
                {editedField.options.map((option: { label: string; value: string; id: string }, index: number) => (
                  <div key={option.id} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                        placeholder="Option label"
                        className={`block w-full px-4 py-2.5 rounded-lg border shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base
                          ${errors[`option-${index}-label`] ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}`}
                      />
                      {errors[`option-${index}-label`] && (
                        <p className="mt-2 text-sm text-red-600">{errors[`option-${index}-label`]}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={option.value}
                        onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                        placeholder="Option value"
                        className={`block w-full px-4 py-2.5 rounded-lg border shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base
                          ${errors[`option-${index}-value`] ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}`}
                      />
                      {errors[`option-${index}-value`] && (
                        <p className="mt-2 text-sm text-red-600">{errors[`option-${index}-value`]}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </motion.div>
  );
} 