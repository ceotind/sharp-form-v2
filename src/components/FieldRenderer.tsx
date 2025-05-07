import { FormField } from '@/types/form';

interface FieldRendererProps {
  field: FormField;
  value?: string | string[] | boolean | Date;
  onChange?: (value: string | string[] | boolean | Date) => void;
  error?: string;
}

export function FieldRenderer({ field, value, onChange, error }: FieldRendererProps) {
  const baseInputClasses = `
    block w-full rounded-md shadow-sm
    focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500
    ${error ? 'border-red-300' : 'border-gray-300'}
  `;

  const labelClasses = `
    block text-sm font-medium text-gray-700 mb-1
    ${field.required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
  `;

  const errorClasses = 'mt-1 text-sm text-red-600';

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            id={field.id}
            name={field.id}
            value={value as string || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseInputClasses}
            aria-describedby={field.helpText ? `${field.id}-help` : undefined}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field.id}
            name={field.id}
            value={value as string || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={field.rows || 3}
            className={baseInputClasses}
            aria-describedby={field.helpText ? `${field.id}-help` : undefined}
          />
        );

      case 'dropdown':
        return (
          <select
            id={field.id}
            name={field.id}
            value={value as string || ''}
            onChange={(e) => onChange?.(e.target.value)}
            required={field.required}
            multiple={field.multiple}
            className={baseInputClasses}
            aria-describedby={field.helpText ? `${field.id}-help` : undefined}
          >
            <option value="">Select an option</option>
            {field.options.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.id}
              name={field.id}
              checked={value as boolean || false}
              onChange={(e) => onChange?.(e.target.checked)}
              required={field.required}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              aria-describedby={field.helpText ? `${field.id}-help` : undefined}
            />
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options.map((option) => (
              <div key={option.id} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.id}-${option.id}`}
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange?.(e.target.value)}
                  required={field.required}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  aria-describedby={field.helpText ? `${field.id}-help` : undefined}
                />
                <label
                  htmlFor={`${field.id}-${option.id}`}
                  className="ml-2 block text-sm text-gray-900"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            id={field.id}
            name={field.id}
            value={value as string || ''}
            onChange={(e) => onChange?.(e.target.value)}
            required={field.required}
            min={field.min}
            max={field.max}
            className={baseInputClasses}
            aria-describedby={field.helpText ? `${field.id}-help` : undefined}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-1">
      <label htmlFor={field.id} className={labelClasses}>
        {field.label}
      </label>
      {renderField()}
      {field.helpText && (
        <p id={`${field.id}-help`} className="mt-1 text-sm text-gray-500">
          {field.helpText}
        </p>
      )}
      {error && <p className={errorClasses}>{error}</p>}
    </div>
  );
} 