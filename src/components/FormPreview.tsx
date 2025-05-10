'use client';

import { FormField } from '@/types/form';

interface FormPreviewProps {
  fields: FormField[];
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  isSubmitting: boolean;
  onFieldEdit?: (field: FormField) => void;
}

interface Option {
  id: string;
  value: string;
  label: string;
}

export function FormPreview({ fields, formData, setFormData, isSubmitting, onFieldEdit }: FormPreviewProps) {
  const handleChange = (fieldId: string, value: any) => {
    setFormData((prev: Record<string, any>) => ({
      ...prev,
      [fieldId]: value
    }));
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

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            id={field.id}
            name={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            disabled={isSubmitting}
            required={field.required}
            placeholder={field.placeholder}
            className={baseInputClasses}
            autoComplete="off"
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field.id}
            name={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            disabled={isSubmitting}
            required={field.required}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            className={baseInputClasses}
          />
        );

      case 'dropdown':
        return (
          <select
            id={field.id}
            name={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            disabled={isSubmitting}
            required={field.required}
            multiple={field.multiple}
            className={baseInputClasses}
          >
            <option value="">{field.placeholder || 'Select an option'}</option>
            {field.options?.map((option: Option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {field.options?.map((option: Option) => (
              <div key={option.id} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.id}-${option.id}`}
                  name={field.id}
                  value={option.value}
                  checked={formData[field.id] === option.value}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  disabled={isSubmitting}
                  required={field.required}
                  className={`${baseRadioCheckboxClasses} rounded-full`}
                />
                <label
                  htmlFor={`${field.id}-${option.id}`}
                  className="ml-2 block text-sm text-gray-700 select-none"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {Array.isArray(field.options) ? (
              field.options.map((option: Option) => (
                <div key={option.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${field.id}-${option.id}`}
                    name={field.id}
                    value={option.value}
                    checked={formData[field.id]?.includes(option.value)}
                    onChange={(e) => {
                      const currentValues = formData[field.id] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v: string) => v !== option.value);
                      handleChange(field.id, newValues);
                    }}
                    disabled={isSubmitting}
                    className={`${baseRadioCheckboxClasses} rounded`}
                  />
                  <label
                    htmlFor={`${field.id}-${option.id}`}
                    className="ml-2 block text-sm text-gray-700 select-none"
                  >
                    {option.label}
                  </label>
                </div>
              ))
            ) : (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={field.id}
                  name={field.id}
                  checked={!!formData[field.id]}
                  onChange={(e) => handleChange(field.id, e.target.checked)}
                  disabled={isSubmitting}
                  required={field.required}
                  className={`${baseRadioCheckboxClasses} rounded`}
                />
                <label
                  htmlFor={field.id}
                  className="ml-2 block text-sm text-gray-700 select-none"
                >
                  {field.label}
                </label>
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            id={field.id}
            name={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            disabled={isSubmitting}
            required={field.required}
            min={field.min}
            max={field.max}
            className={baseInputClasses}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 py-2">
      {fields.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-500">No form fields added yet</p>
          <p className="text-sm text-gray-400 mt-1">Add fields to preview your form</p>
        </div>
      ) : (
        fields.map(field => (
          <div key={field.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm relative group">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              {onFieldEdit && (
                <button
                  onClick={() => onFieldEdit(field)}
                  className="rounded-md p-2 hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                  title="Edit field"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>
            <div className="space-y-2 mb-3">
              <label
                htmlFor={field.id}
                className="text-base font-medium text-gray-900 block"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.helpText && (
                <p className="text-sm text-gray-500">{field.helpText}</p>
              )}
              {field.description && (
                <p className="text-sm text-gray-400">{field.description}</p>
              )}
            </div>
            <div>
              {renderField(field)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
