// Field Types
export type FieldType = 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'radio' | 'date';

// Base field interface with common properties
interface BaseField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
}

// Text field interface
interface TextField extends BaseField {
  type: 'text';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

// Textarea field interface
interface TextareaField extends BaseField {
  type: 'textarea';
  minLength?: number;
  maxLength?: number;
  rows?: number;
}

// Option interface for dropdown and radio fields
interface Option {
  id: string;
  label: string;
  value: string;
}

// Dropdown field interface
interface DropdownField extends BaseField {
  type: 'dropdown';
  options: Option[];
  multiple?: boolean;
}

// Checkbox field interface
interface CheckboxField extends BaseField {
  type: 'checkbox';
  checked?: boolean;
}

// Radio field interface
interface RadioField extends BaseField {
  type: 'radio';
  options: Option[];
}

// Date field interface
interface DateField extends BaseField {
  type: 'date';
  min?: string;
  max?: string;
}

// Union type for all field types
export type FormField = 
  | TextField 
  | TextareaField 
  | DropdownField 
  | CheckboxField 
  | RadioField 
  | DateField;

// Form interface
export interface Form {
  title: string;
  description?: string;
  fields: FormField[];
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  createdBy: string;
  settings?: {
    allowMultipleResponses: boolean;
    customSuccessMessage: string;
    customErrorMessage: string;
    themeBackground?: string;
    textColor?: string;
    accentColor?: string;
  };
}

// Form Response interface
export interface FormResponse {
  id: string;
  formId: string;
  responses: {
    fieldId: string;
    value: string | string[] | boolean | Date;
  }[];
  submittedAt: Date;
  submittedBy?: string;
}

// Form Settings interface
export interface FormSettings {
  allowMultipleResponses?: boolean;
  responseLimit?: number;
  customSuccessMessage?: string;
  customErrorMessage?: string;
  theme?: 'light' | 'dark';
  submitButtonText?: string;
  successMessage?: string;
  customSlug?: string;
  themeBackground?: string;
  textColor?: string;
  accentColor?: string;
  // Add more theme-related fields as needed
}