// Field Types
export type FieldType = 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'radio' | 'date' | 'email' | 'number' | 'url' | 'tel';

// Option interface for dropdown, radio and checkbox fields
export interface Option {
  id: string;
  value: string;
  label: string;
}

// Validation interface
export interface ValidationRules {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: string | number;
  max?: string | number;
  customValidation?: (value: any) => string | undefined;
}

// Error messages interface
export interface ErrorMessages {
  required?: string;
  minLength?: string;
  maxLength?: string;
  pattern?: string;
  min?: string;
  max?: string;
  type?: string;
  customValidation?: string;
}

// Base field interface with common properties
export interface BaseField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  helpText?: string;
  placeholder?: string;
  required: boolean;
  defaultValue?: any;
  validation?: ValidationRules;
  errorMessages?: ErrorMessages;
}

// Text field interface
export interface TextField extends BaseField {
  type: 'text' | 'email' | 'url' | 'tel' | 'number';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

// Textarea field interface
export interface TextareaField extends BaseField {
  type: 'textarea';
  rows?: number;
  minLength?: number;
  maxLength?: number;
}

// Dropdown field interface
export interface DropdownField extends BaseField {
  type: 'dropdown';
  options: Option[];
  multiple?: boolean;
}

// Checkbox field interface
export interface CheckboxField extends BaseField {
  type: 'checkbox';
  options?: Option[];
  checked?: boolean;
}

// Radio field interface
export interface RadioField extends BaseField {
  type: 'radio';
  options: Option[];
}

// Date field interface
export interface DateField extends BaseField {
  type: 'date';
  minDate?: string;
  maxDate?: string;
  validation?: ValidationRules & {
    minDate?: string;
    maxDate?: string;
  };
  errorMessages?: ErrorMessages & {
    minDate?: string;
    maxDate?: string;
  };
}

// Union type for all field types
export type FormField = TextField | TextareaField | DropdownField | CheckboxField | RadioField | DateField;

// Form interface
export interface Form {
  id?: string;
  title: string;
  description?: string;
  fields: FormField[];
  createdAt: Date | any;
  updatedAt: Date | any;
  published: boolean;
  createdBy?: string;
  responseCount?: number;
  lastResponseAt?: Date | any;
  customSlug?: string;
  settings?: FormSettings;
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
    timestamp?: any;
    [key: string]: any;
  };
}

// Form Settings interface
export interface FormSettings {
  allowMultipleResponses: boolean;
  customSuccessMessage: string;
  customErrorMessage: string;
  responseLimit?: number;
  theme?: 'light' | 'dark';
  submitButtonText?: string;
  successMessage?: string;
  customSlug?: string;
  themeBackground?: string;
  textColor?: string;
  accentColor?: string;
}