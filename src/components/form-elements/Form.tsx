import React, { useState, useEffect } from 'react';
import { FormField } from '@/types/form';
import { BaseFormElement } from './BaseFormElement';
import { getDefaultFieldValues, validateFormField } from './utils/formElementUtils';

interface FormProps {
  fields: FormField[];
  onSubmit: (values: Record<string, any>) => void;
  initialValues?: Record<string, any>;
  onChange?: (values: Record<string, any>) => void;
  submitText?: string;
  disabled?: boolean;
  className?: string;
}

export const Form: React.FC<FormProps> = ({
  fields,
  onSubmit,
  initialValues = {},
  onChange,
  submitText = 'Submit',
  disabled = false,
  className = '',
}) => {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  useEffect(() => {
    if (fields.length > 0 && Object.keys(initialValues).length === 0) {
      setValues(getDefaultFieldValues(fields));
    }
  }, [fields, initialValues]);

  const handleChange = (fieldId: string, value: any) => {
    const newValues = {
      ...values,
      [fieldId]: value,
    };
    
    setValues(newValues);
    onChange?.(newValues);

    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach((field) => {
      if (field.required && (values[field.id] === undefined || values[field.id] === '')) {
        newErrors[field.id] = 'This field is required';
        isValid = false;
      } else {
        const error = validateFormField(field, values[field.id]);
        if (error) {
          newErrors[field.id] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {fields.map((field) => (
        <div key={field.id}>
          <BaseFormElement
            element={field}
            value={values[field.id]}
            onChange={(value) => handleChange(field.id, value)}
            error={errors[field.id]}
            disabled={disabled || isSubmitting}
          />
        </div>
      ))}

      <div>
        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : submitText}
        </button>
      </div>
    </form>
  );
};

export default Form;
