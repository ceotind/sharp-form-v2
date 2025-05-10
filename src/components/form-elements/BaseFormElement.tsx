import React from 'react';
import { FormField } from '@/types/form';
import { formElementRegistry } from './registry/FormElementRegistry';

interface BaseFormElementProps {
  element: FormField;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
}

export const BaseFormElement: React.FC<BaseFormElementProps> = ({
  element,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
}) => {
  const { type, label, required, helpText, placeholder } = element;
  const elementConfig = formElementRegistry.getConfig(type);

  if (!elementConfig) {
    console.error(`No form element found for type: ${type}`);
    return null;
  }

  const handleChange = (newValue: any) => {
    const transformedValue = formElementRegistry.transformValue(type, newValue);
    onChange(transformedValue);
  };

  const validationError = formElementRegistry.validate(type, value, element);
  const displayError = error || validationError;

  const baseClasses = 'block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500';
  const errorClasses = displayError ? 'border-red-300' : 'border-gray-300';
  const disabledClasses = disabled ? 'bg-gray-50 text-gray-500' : '';
  
  const labelClasses = `block text-sm font-medium text-gray-700 mb-1 ${
    required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''
  }`;

  const elementProps = {
    value,
    onChange: handleChange,
    onBlur,
    disabled,
    placeholder: placeholder || `Enter ${label.toLowerCase()}`,
    className: `${baseClasses} ${errorClasses} ${disabledClasses}`,
    'aria-invalid': !!displayError,
    'aria-describedby': helpText ? `${element.id}-help` : undefined,
  };

  return (
    <div className="mb-4">
      <label htmlFor={element.id} className={labelClasses}>
        {label}
      </label>
      
      <div className="mt-1">
        {React.createElement(formElementRegistry.get(type)?.render as any, {
          field: element,
          value,
          onChange: handleChange,
          onBlur,
          error: displayError,
          disabled,
        })}
      </div>
      
      {helpText && (
        <p className="mt-2 text-sm text-gray-500" id={`${element.id}-help`}>
          {helpText}
        </p>
      )}
      
      {displayError && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {displayError}
        </p>
      )}
    </div>
  );
};

export default BaseFormElement;
