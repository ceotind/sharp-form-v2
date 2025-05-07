import React from 'react';
import { FormField } from '@/types/form';
import { FormElement, FormElementProps } from '@/types/form-element';
import { formElementRegistry } from '../registry/FormElementRegistry';
import { ChevronDown } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  value: string;
}

const SelectInput: React.FC<FormElementProps<string | string[]>> = ({
  field,
  value = '',
  onChange,
  error,
  disabled,
}) => {
  const options = field.options || [];
  const isMultiple = field.multiple || false;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    onChange(isMultiple ? selectedOptions : selectedOptions[0] || '');
  };

  const selectedValue = isMultiple 
    ? Array.isArray(value) ? value : []
    : value || '';

  return (
    <select
      id={field.id}
      name={field.id}
      multiple={isMultiple}
      value={selectedValue}
      onChange={handleChange}
      disabled={disabled}
      className={`block w-full rounded-md shadow-sm ${
        error ? 'border-red-300' : 'border-gray-300'
      } focus:ring-blue-500 focus:border-blue-500`}
      aria-invalid={!!error}
      aria-describedby={error ? `${field.id}-error` : undefined}
    >
      {!field.required && !isMultiple && (
        <option value="">{field.placeholder || 'Select an option'}</option>
      )}
      {options.map((option: Option) => (
        <option key={option.id} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Register the select input element
const selectElement: FormElement = {
  type: 'select',
  config: {
    type: 'select',
    name: 'Select',
    icon: <ChevronDown className="w-4 h-4" />,
    description: 'A dropdown select input',
    defaultOptions: {
      label: 'Select an option',
      required: false,
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ],
    },
    editor: {
      fields: [
        {
          name: 'label',
          label: 'Label',
          type: 'text',
        },
        {
          name: 'required',
          label: 'Required',
          type: 'checkbox',
        },
        {
          name: 'multiple',
          label: 'Multiple Selection',
          type: 'checkbox',
        },
        {
          name: 'options',
          label: 'Options',
          type: 'text',
        },
        // Description can be added as a separate help text element in the UI
      ],
    },
    database: {
      collection: 'form_select_inputs',
      schema: (field: FormField) => ({
        type: field.multiple ? 'array' : 'string',
        items: {
          type: 'string',
        },
      }),
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
  render: SelectInput,
  getDefaultValue: () => '',
  validate: (value: any, field: any) => {
    if (field.required) {
      if (field.multiple) {
        if (!Array.isArray(value) || value.length === 0) {
          return 'At least one option must be selected';
        }
      } else if (!value) {
        return 'This field is required';
      }
    }
    return undefined;
  },
  transformValue: (value: any) => {
    if (Array.isArray(value)) {
      return value.filter(Boolean);
    }
    return value || '';
  },
};

// Register the element
formElementRegistry.register(selectElement);

export default SelectInput;
