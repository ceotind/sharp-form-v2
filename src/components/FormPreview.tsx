'use client';

import { FormField } from '@/types/form';

interface FormPreviewProps {
  fields: FormField[];
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  isSubmitting: boolean;
}

export function FormPreview({ fields, formData, setFormData, isSubmitting }: FormPreviewProps) {
  const handleChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.id,
      name: field.id,
      value: formData[field.id] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleChange(field.id, e.target.value),
      disabled: isSubmitting,
      required: field.required,
      className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    };

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={field.placeholder}
            {...commonProps}
          />
        );
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder}
            rows={4}
            {...commonProps}
          />
        );
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select an option</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.id}-${option.value}`}
                  name={field.id}
                  value={option.value}
                  checked={formData[field.id] === option.value}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  disabled={isSubmitting}
                  required={field.required}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label
                  htmlFor={`${field.id}-${option.value}`}
                  className="ml-2 block text-sm text-gray-700"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`${field.id}-${option.value}`}
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
                  required={field.required}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label
                  htmlFor={`${field.id}-${option.value}`}
                  className="ml-2 block text-sm text-gray-700"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {fields.map(field => (
        <div key={field.id}>
          <label
            htmlFor={field.id}
            className="block text-sm font-medium text-gray-700"
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.description && (
            <p className="mt-1 text-sm text-gray-500">{field.description}</p>
          )}
          <div className="mt-1">
            {renderField(field)}
          </div>
        </div>
      ))}
    </div>
  );
} 