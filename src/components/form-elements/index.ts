// Export the registry
export { formElementRegistry } from './registry/FormElementRegistry';

// Export base components
export { default as BaseFormElement } from './BaseFormElement';

export { default as Form } from './Form';
export { default as FormBuilder } from './FormBuilder';
export { default as SortableField } from './SortableField';

// Export utilities
export * from './utils/formElementUtils';
export * from './utils/validation';

// Export individual elements
import './elements/TextInput';
import './elements/SelectInput';
import './elements/CheckboxInput';
import './elements/DateInput';
import './elements/RadioGroup';
import './elements/TextareaInput';

// Re-export types
export type { FormElement, FormElementProps } from '@/types/form-element';
