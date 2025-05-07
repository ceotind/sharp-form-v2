import React from 'react';
import { FormElement, FormElementProps } from '@/types/form-element';
import { formElementRegistry } from '../registry/FormElementRegistry';

const TextInput: React.FC<FormElementProps<string>> = ({
  field,
  value = '',
  onChange,
  error,
  disabled,
}) => {
  return (
    <input
      type="text"
      id={field.id}
      name={field.id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      required={field.required}
      disabled={disabled}
      className={`block w-full rounded-md shadow-sm ${
        error ? 'border-red-300' : 'border-gray-300'
      } focus:ring-blue-500 focus:border-blue-500`}
      aria-invalid={!!error}
      aria-describedby={error ? `${field.id}-error` : undefined}
    />
  );
};

// Import icons
import { TextCursorInput } from 'lucide-react';

// Register the text input element
const textInputElement: FormElement = {
  type: 'text',
  config: {
    type: 'text',
    name: 'Text Input',
    icon: <TextCursorInput className="w-4 h-4" />,
    description: 'A single line text input field',
    defaultOptions: {
      placeholder: 'Enter text',
      required: false,
    },
    editor: {
      fields: [
        {
          name: 'placeholder',
          label: 'Placeholder',
          type: 'text',
        },
        {
          name: 'required',
          label: 'Required',
          type: 'checkbox',
        },
      ],
    },
    database: {
      collection: 'form_text_inputs',
      schema: {
        type: 'string',
        maxLength: 255,
      },
      indexes: [
        {
          fields: ['value'],
          options: {
            unique: false,
          },
        },
      ],
    },
  },
  render: TextInput,
  getDefaultValue: () => '',
  validate: (value: string, field: any) => {
    if (field.required && !value?.trim()) {
      return 'This field is required';
    }
    if (field.minLength && value.length < field.minLength) {
      return `Must be at least ${field.minLength} characters`;
    }
    if (field.maxLength && value.length > field.maxLength) {
      return `Must be at most ${field.maxLength} characters`;
    }
    if (field.pattern && !new RegExp(field.pattern).test(value)) {
      return 'Invalid format';
    }
    return undefined;
  },
};

// Register the element
formElementRegistry.register(textInputElement);

export default TextInput;
