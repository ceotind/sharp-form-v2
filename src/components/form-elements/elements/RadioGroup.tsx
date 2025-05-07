import React from 'react';
import { FormField } from '@/types/form';
import { FormElement, FormElementProps } from '@/types/form-element';
import { formElementRegistry } from '../registry/FormElementRegistry';
import { Dot } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  value: string;
}

const RadioGroup: React.FC<FormElementProps<string>> = ({
  field,
  value = '',
  onChange,
  error,
  disabled,
}) => {
  const options: Option[] = field.options || [];

  const handleChange = (optionValue: string) => {
    onChange(optionValue);
  };

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <div key={option.id} className="flex items-center">
          <input
            id={`${field.id}-${option.id}`}
            name={field.id}
            type="radio"
            checked={value === option.value}
            onChange={() => handleChange(option.value)}
            disabled={disabled}
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <label
            htmlFor={`${field.id}-${option.id}`}
            className="ml-3 block text-sm font-medium text-gray-700"
          >
            {option.label}
          </label>
        </div>
      ))}
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${field.id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

// Register the radio group element
const radioGroupElement: FormElement = {
  type: 'radio-group',
  config: {
    type: 'radio-group',
    name: 'Radio Group',
    icon: <Dot className="w-4 h-4" />,
    description: 'A group of radio buttons',
    defaultOptions: {
      label: 'Select an option',
      required: false,
      options: [
        { id: '1', label: 'Option 1', value: 'option1' },
        { id: '2', label: 'Option 2', value: 'option2' },
      ],
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
          name: 'required',
          label: 'Required',
          type: 'checkbox',
        },
        {
          name: 'options',
          label: 'Options',
          type: 'text',
          description: 'Enter options as comma-separated values (e.g., "Option 1, Option 2")',
        },
      ],
    },
    database: {
      collection: 'form_radio_groups',
      schema: {
        type: 'string',
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
  render: RadioGroup,
  getDefaultValue: () => '',
  validate: (value: string, field: any) => {
    if (field.required && !value) {
      return 'Please select an option';
    }
    return undefined;
  },
};

// Register the element
formElementRegistry.register(radioGroupElement);

export default RadioGroup;
