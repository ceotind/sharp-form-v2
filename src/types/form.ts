// Field Types
export type FieldType = 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'radio' | 'date' | string;

// Base field interface with common properties
export interface BaseField {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  [key: string]: any; // Allow for custom properties
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
export type FormField = BaseField & {
  [key: string]: any;
};

// Form interface
export interface Form {
  id?: string;
  title: string;
  description?: string;
  fields: FormField[];
  createdAt: Date | any; // Allow Firestore timestamp
  updatedAt: Date | any; // Allow Firestore timestamp
  published: boolean;
  createdBy: string;
  responseCount?: number;
  lastResponseAt?: Date | any;
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
  id?: string;
  formId: string;
  responses: {
    fieldId: string;
    value: string | string[] | boolean | Date | any;
  }[];
  submittedAt: Date | any;
  submittedBy?: string;
  metadata?: {
    userAgent?: string;
    timestamp?: any; // Firestore timestamp
    [key: string]: any;
  };
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