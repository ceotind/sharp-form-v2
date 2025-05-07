import { FormField } from './form';

export type FormElementType = FormField['type'] | string;

export interface FormElementProps<T = any> {
  field: FormField;
  value: T;
  onChange: (value: T) => void;
  error?: string;
  disabled?: boolean;
}

export interface FormElementOptions {
  id: string;
  label: string;
  value: string;
  [key: string]: any;
}

export interface FormElementValidation {
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number | string;
  max?: number | string;
  custom?: (value: any) => string | boolean;
}

export interface FormElementField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea';
  options?: Array<{ label: string; value: string }>;
  required?: boolean;
  inputType?: string; // HTML input type (e.g., 'date', 'email', 'password')
  description?: string;
}

export interface FormElementConfig {
  type: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  defaultOptions?: Record<string, any>;
  editor?: {
    fields: FormElementField[];
  };
  database?: {
    collection: string;
    schema: Record<string, any>;
    indexes?: Array<{
      fields: string | string[];
      options?: Record<string, any>;
    }>;
  };
}

export interface FormElement<T = any> {
  type: string;
  config: FormElementConfig;
  render: (props: FormElementProps<T>) => React.ReactNode;
  validate?: (value: T, field: FormField) => string | undefined;
  getDefaultValue: () => T;
  transformValue?: (value: any) => any;
}
