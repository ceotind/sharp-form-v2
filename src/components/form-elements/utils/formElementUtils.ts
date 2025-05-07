import { FormField } from '@/types/form';
import { formElementRegistry } from '../registry/FormElementRegistry';

export function getDefaultFieldValues(fields: FormField[]): Record<string, any> {
  return fields.reduce((acc, field) => {
    acc[field.id] = formElementRegistry.getDefaultValue(field.type);
    return acc;
  }, {} as Record<string, any>);
}

export function validateFormField(field: FormField, value: any): string | undefined {
  return formElementRegistry.validate(field.type, value, field);
}

export function transformFieldValue(field: FormField, value: any): any {
  return formElementRegistry.transformValue(field.type, value);
}

export function createNewField(type: string, options: Partial<FormField> = {}): FormField {
  const baseField: FormField = {
    id: `field-${Math.random().toString(36).substr(2, 9)}`,
    type,
    label: `New ${type} field`,
    required: false,
    ...options,
  };

  const config = formElementRegistry.getConfig(type);
  if (config?.defaultOptions) {
    return { ...config.defaultOptions, ...baseField };
  }

  return baseField;
}
