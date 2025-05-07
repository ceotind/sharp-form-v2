import { FormField } from '@/types/form';

type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

export const validateForm = (
  fields: FormField[],
  values: Record<string, any>
): ValidationResult => {
  const errors: Record<string, string> = {};
  let isValid = true;

  fields.forEach((field) => {
    const value = values[field.id];
    const error = validateField(field, value);
    
    if (error) {
      errors[field.id] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
};

export const validateField = (
  field: FormField,
  value: any
): string | undefined => {
  // Required validation
  if (field.required) {
    if (value === undefined || value === null || value === '') {
      return field.errorMessages?.required || 'This field is required';
    }
  }

  // Type-specific validations
  switch (field.type) {
    case 'email':
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return field.errorMessages?.pattern || 'Please enter a valid email address';
      }
      break;

    case 'number':
      if (value && isNaN(Number(value))) {
        return field.errorMessages?.type || 'Please enter a valid number';
      }
      if (field.min !== undefined && Number(value) < field.min) {
        return field.errorMessages?.min || `Value must be at least ${field.min}`;
      }
      if (field.max !== undefined && Number(value) > field.max) {
        return field.errorMessages?.max || `Value must be at most ${field.max}`;
      }
      break;

    case 'text':
    case 'textarea':
      if (field.minLength && String(value).length < field.minLength) {
        return field.errorMessages?.minLength || `Must be at least ${field.minLength} characters`;
      }
      if (field.maxLength && String(value).length > field.maxLength) {
        return field.errorMessages?.maxLength || `Must be at most ${field.maxLength} characters`;
      }
      if (field.pattern && value && !new RegExp(field.pattern).test(value)) {
        return field.errorMessages?.pattern || 'Invalid format';
      }
      break;

    case 'select':
    case 'radio-group':
      if (field.required && !value) {
        return field.errorMessages?.required || 'Please select an option';
      }
      break;

    case 'checkbox':
      if (field.required && !value) {
        return field.errorMessages?.required || 'This field must be checked';
      }
      break;

    case 'date':
      if (value) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return field.errorMessages?.type || 'Please enter a valid date';
        }
        if (field.minDate && new Date(field.minDate) > date) {
          return field.errorMessages?.minDate || `Date must be after ${new Date(field.minDate).toLocaleDateString()}`;
        }
        if (field.maxDate && new Date(field.maxDate) < date) {
          return field.errorMessages?.maxDate || `Date must be before ${new Date(field.maxDate).toLocaleDateString()}`;
        }
      }
      break;
  }

  // Custom validation function
  if (field.validate && typeof field.validate === 'function') {
    const customError = field.validate(value, field);
    if (customError) {
      return customError;
    }
  }

  return undefined;
};

export const getInitialValues = (fields: FormField[]): Record<string, any> => {
  return fields.reduce((acc, field) => {
    acc[field.id] = field.defaultValue ?? '';
    return acc;
  }, {} as Record<string, any>);
};

export const getFieldError = (
  field: FormField,
  errors: Record<string, string>
): string | undefined => {
  return errors[field.id];
};
