import React, { useState, useEffect } from 'react';
import { FormField } from '@/types/form';
import { BaseFormElement } from './BaseFormElement';
import { validateForm, validateField, getInitialValues } from './utils/validation';

interface FormProps {
  fields: FormField[];
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Initialize form with default values
  useEffect(() => {
    if (fields.length > 0 && Object.keys(initialValues).length === 0) {
      setValues(getInitialValues(fields));
    }
  }, [fields, initialValues]);

  // Validate field on blur
  const handleBlur = (fieldId: string) => {
    setTouched(prev => ({ ...prev, [fieldId]: true }));
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const error = validateField(field, values[fieldId]);
      setErrors(prev => ({
        ...prev,
        [fieldId]: error || ''
      }));
    }
  };

  const handleChange = (fieldId: string, value: any) => {
    const newValues = {
      ...values,
      [fieldId]: value,
    };
    
    setValues(newValues);
    onChange?.(newValues);

    // If the field has been touched, validate on change
    if (touched[fieldId]) {
      const field = fields.find(f => f.id === fieldId);
      if (field) {
        const error = validateField(field, value);
        setErrors(prev => ({
          ...prev,
          [fieldId]: error || ''
        }));
      }
    }
  };

  const validateFormData = (): boolean => {
    setIsValidating(true);
    try {
      const result = validateForm(fields, values);
      setErrors(result.errors);
      
      // Mark all fields as touched when form is submitted
      const newTouched = fields.reduce((acc, field) => {
        acc[field.id] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setTouched(newTouched);

      return result.isValid;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateFormData()) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`space-y-6 ${className}`}
      noValidate
    >
      {fields.map((field) => (
        <div key={field.id}>
          <BaseFormElement
            element={field}
            value={values[field.id]}
            onChange={(value) => handleChange(field.id, value)}
            onBlur={() => handleBlur(field.id)}
            error={touched[field.id] ? errors[field.id] : undefined}
            disabled={disabled || isSubmitting}
          />
        </div>
      ))}

      <div>
        <button
          type="submit"
          disabled={disabled || isSubmitting || isValidating}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 
           isValidating ? 'Validating...' : 
           submitText}
        </button>
      </div>
    </form>
  );
};

export default Form;
