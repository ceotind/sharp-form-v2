import React from 'react';
import { FormField } from '@/types/form';
import { FormElement, FormElementProps } from '@/types/form-element';
import { formElementRegistry } from '../registry/FormElementRegistry';
import { TextQuote } from 'lucide-react';

const TextareaInput: React.FC<FormElementProps<string>> = ({
  field,
  value = '',
  onChange,
  error,
  disabled,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <textarea
        id={field.id}
        name={field.id}
        value={value}
        onChange={handleChange}
        placeholder={field.placeholder}
        disabled={disabled}
        rows={field.rows || 3}
        className={`block w-full rounded-md shadow-sm ${
          error ? 'border-red-300' : 'border-gray-300'
        } focus:ring-blue-500 focus:border-blue-500`}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${field.id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

// Register the textarea input element
const textareaInputElement: FormElement = {
  type: 'textarea',
  config: {
    type: 'textarea',
    name: 'Text Area',
    icon: <TextQuote className="w-4 h-4" />,
    description: 'A multi-line text input field',
    defaultOptions: {
      label: 'Your message',
      placeholder: 'Enter text',
      required: false,
      rows: 4,
    },
    editor: {
      fields: [
        {
          name: 'label',
          label: 'Label',
          type: 'text',
          required: true,
        },
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
        {
          name: 'rows',
          label: 'Rows',
          type: 'number',
          inputType: 'number',
        },
      ],
    },
    database: {
      collection: 'form_textareas',
      schema: {
        type: 'string',
      },
    },
  },
  render: TextareaInput,
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
    return undefined;
  },
};

// Register the element
formElementRegistry.register(textareaInputElement);

export default TextareaInput;
