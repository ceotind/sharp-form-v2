import React from 'react';
import { FormField } from '@/types/form';
import { FormElement, FormElementProps } from '@/types/form-element';
import { formElementRegistry } from '../registry/FormElementRegistry';
import { Calendar } from 'lucide-react';

const DateInput: React.FC<FormElementProps<string>> = ({
  field,
  value = '',
  onChange,
  error,
  disabled,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <input
        type="date"
        id={field.id}
        name={field.id}
        value={value || ''}
        onChange={handleChange}
        min={field.minDate}
        max={field.maxDate}
        disabled={disabled}
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

// Register the date input element
const dateInputElement: FormElement = {
  type: 'date',
  config: {
    type: 'date',
    name: 'Date Input',
    icon: <Calendar className="w-4 h-4" />,
    description: 'A date picker input',
    defaultOptions: {
      label: 'Date',
      required: false,
      minDate: '',
      maxDate: '',
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
          name: 'minDate',
          label: 'Minimum Date',
          type: 'text',
          inputType: 'date',
        },
        {
          name: 'maxDate',
          label: 'Maximum Date',
          type: 'text',
          inputType: 'date',
        },
      ],
    },
    database: {
      collection: 'form_date_inputs',
      schema: {
        type: 'string',
        format: 'date',
      },
    },
  },
  render: DateInput,
  getDefaultValue: () => '',
  validate: (value: string, field: any) => {
    if (field.required && !value) {
      return 'This field is required';
    }
    
    if (value) {
      const date = new Date(value);
      
      if (field.minDate && new Date(field.minDate) > date) {
        return `Date must be after ${new Date(field.minDate).toLocaleDateString()}`;
      }
      
      if (field.maxDate && new Date(field.maxDate) < date) {
        return `Date must be before ${new Date(field.maxDate).toLocaleDateString()}`;
      }
    }
    
    return undefined;
  },
};

// Register the element
formElementRegistry.register(dateInputElement);

export default DateInput;
