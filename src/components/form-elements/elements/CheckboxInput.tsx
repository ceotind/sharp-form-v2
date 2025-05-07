import React from 'react';
import { FormField } from '@/types/form';
import { FormElement, FormElementProps } from '@/types/form-element';
import { formElementRegistry } from '../registry/FormElementRegistry';
import { CheckSquare } from 'lucide-react';

const CheckboxInput: React.FC<FormElementProps<boolean>> = ({
  field,
  value = false,
  onChange,
  error,
  disabled,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <div className="flex items-center">
      <input
        id={field.id}
        name={field.id}
        type="checkbox"
        checked={Boolean(value)}
        onChange={handleChange}
        disabled={disabled}
        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.id}-error` : undefined}
      />
      <label
        htmlFor={field.id}
        className="ml-2 block text-sm text-gray-900"
      >
        {field.label}
        {field.required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${field.id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

// Register the checkbox input element
const checkboxElement: FormElement = {
  type: 'checkbox',
  config: {
    type: 'checkbox',
    name: 'Checkbox',
    icon: <CheckSquare className="w-4 h-4" />,
    description: 'A single checkbox input',
    defaultOptions: {
      label: 'Checkbox',
      required: false,
      checked: false,
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
          name: 'checked',
          label: 'Checked by default',
          type: 'checkbox',
        },
      ],
    },
    database: {
      collection: 'form_checkbox_inputs',
      schema: {
        type: 'boolean',
      },
    },
  },
  render: CheckboxInput,
  getDefaultValue: () => false,
  validate: (value: boolean, field: any) => {
    if (field.required && !value) {
      return 'This field must be checked';
    }
    return undefined;
  },
};

// Register the element
formElementRegistry.register(checkboxElement);

export default CheckboxInput;
