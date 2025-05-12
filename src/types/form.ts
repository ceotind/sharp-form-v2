export interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  acceptedTypes?: string[];
  placeholder?: string;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  createdBy: string;
  createdAt: any;
  updatedAt: any;
  isPublished: boolean;
  customSlug?: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  answers: Record<string, any>;
  submittedBy: string;
  submittedAt: any;
}
