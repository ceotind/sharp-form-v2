import { FormField, ValidationRules } from '@/types/form';

type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

// Enhanced validation utility functions
const isEmptyValue = (value: any): boolean => {
  if (Array.isArray(value)) return value.length === 0;
  return value === undefined || value === null || value === '';
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]{7,}$/;
  return phoneRegex.test(phone);
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
  // Skip validation if value is empty and field is not required
  if (!field.required && isEmptyValue(value)) {
    return undefined;
  }

  // Required validation with custom message support
  if (field.required && isEmptyValue(value)) {
    return field.errorMessages?.required || `${field.label || 'This field'} is required`;
  }

  // Skip further validation if value is empty
  if (isEmptyValue(value)) {
    return undefined;
  }

  // Common validations from field.validation if present
  if (field.validation) {
    // String length validations
    if (field.validation.minLength && String(value).length < field.validation.minLength) {
      return field.errorMessages?.minLength || 
        `${field.label} must be at least ${field.validation.minLength} characters`;
    }
    if (field.validation.maxLength && String(value).length > field.validation.maxLength) {
      return field.errorMessages?.maxLength || 
        `${field.label} must be at most ${field.validation.maxLength} characters`;
    }

    // Pattern validation
    if (field.validation.pattern && !new RegExp(field.validation.pattern).test(String(value))) {
      return field.errorMessages?.pattern || `${field.label} format is invalid`;
    }

    // Min/Max value validations
    if (field.validation.min !== undefined) {
      const minValue = typeof field.validation.min === 'string' ? 
        new Date(field.validation.min).getTime() :
        Number(field.validation.min);
      const valueNum = field.type === 'date' ? 
        new Date(value).getTime() :
        Number(value);
        
      if (!isNaN(minValue) && !isNaN(valueNum) && valueNum < minValue) {
        return field.type === 'date' ?
          (field.errorMessages?.min || `${field.label} must be after ${new Date(minValue).toLocaleDateString()}`) :
          (field.errorMessages?.min || `${field.label} must be at least ${field.validation.min}`);
      }
    }

    if (field.validation.max !== undefined) {
      const maxValue = typeof field.validation.max === 'string' ? 
        new Date(field.validation.max).getTime() :
        Number(field.validation.max);
      const valueNum = field.type === 'date' ? 
        new Date(value).getTime() :
        Number(value);
        
      if (!isNaN(maxValue) && !isNaN(valueNum) && valueNum > maxValue) {
        return field.type === 'date' ?
          (field.errorMessages?.max || `${field.label} must be before ${new Date(maxValue).toLocaleDateString()}`) :
          (field.errorMessages?.max || `${field.label} must be at most ${field.validation.max}`);
      }
    }

    // Custom validation
    if (field.validation.customValidation) {
      const customResult = field.validation.customValidation(value);
      if (customResult) {
        return field.errorMessages?.customValidation || customResult;
      }
    }
  }

  // Type-specific validations
  switch (field.type) {
    case 'email':
      if (!validateEmail(String(value))) {
        return field.errorMessages?.type || 'Please enter a valid email address';
      }
      break;

    case 'number':
      if (isNaN(Number(value))) {
        return field.errorMessages?.type || 'Please enter a valid number';
      }
      break;

    case 'dropdown':
    case 'radio':
      if (field.required && !value) {
        return field.errorMessages?.required || `Please select a ${field.label.toLowerCase()}`;
      }
      if (field.options && !field.options.some(opt => opt.value === value)) {
        return field.errorMessages?.type || 'Please select a valid option';
      }
      break;

    case 'checkbox':
      if ('options' in field && field.options) {
        if (field.required && (!Array.isArray(value) || value.length === 0)) {
          return field.errorMessages?.required || 'Please select at least one option';
        }
        if (Array.isArray(value) && !value.every(v => field.options?.some(opt => opt.value === v))) {
          return field.errorMessages?.type || 'One or more selected options are invalid';
        }
      } else {
        if (field.required && !value) {
          return field.errorMessages?.required || 'This checkbox must be checked';
        }
      }
      break;

    case 'date':
      if (value) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return field.errorMessages?.type || 'Please enter a valid date';
        }
        if ('minDate' in field && field.minDate && new Date(field.minDate) > date) {
          return field.errorMessages?.minDate || 
            `Date must be after ${new Date(field.minDate).toLocaleDateString()}`;
        }
        if ('maxDate' in field && field.maxDate && new Date(field.maxDate) < date) {
          return field.errorMessages?.maxDate || 
            `Date must be before ${new Date(field.maxDate).toLocaleDateString()}`;
        }
      }
      break;
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
