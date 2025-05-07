# Form Elements System

A flexible and extensible form elements system for React applications. This system provides a collection of reusable form components that can be easily customized and extended.

## Features

- **Extensible Architecture**: Easily add new form element types
- **TypeScript Support**: Full type safety with TypeScript
- **Form Builder**: Visual form builder with drag-and-drop interface
- **Validation**: Built-in validation with support for custom validation functions
- **Database Integration**: Each form element includes database schema configuration
- **Responsive Design**: Works on all screen sizes

## Available Form Elements

- Text Input
- Textarea
- Select (Dropdown)
- Checkbox
- Radio Group
- Date Picker

## Installation

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @heroicons/react
```

## Usage

### Basic Form Example

```tsx
import { Form } from '@/components/form-elements';

const MyForm = () => {
  const fields = [
    {
      id: 'name',
      type: 'text',
      label: 'Full Name',
      required: true,
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email Address',
      required: true,
    },
  ];

  const handleSubmit = (values: Record<string, any>) => {
    console.log('Form submitted:', values);
  };

  return <Form fields={fields} onSubmit={handleSubmit} />;
};
```

### Using the Form Builder

```tsx
import { FormBuilder } from '@/components/form-elements';

const FormBuilderPage = () => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  return (
    <div className="h-screen">
      <FormBuilder
        fields={fields}
        onChange={setFields}
        onFieldSelect={(field) => setSelectedFieldId(field.id)}
        selectedFieldId={selectedFieldId}
      />
    </div>
  );
};
```

## Creating Custom Form Elements

1. Create a new file in `src/components/form-elements/elements/`
2. Define your component and its configuration
3. Register it using `formElementRegistry.register()`

Example:

```tsx
// MyCustomElement.tsx
import { FormElement } from '@/types/form-element';
import { formElementRegistry } from '../registry/FormElementRegistry';

const MyCustomElement: React.FC<FormElementProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
}) => {
  // Your component implementation
};

const myCustomElement: FormElement = {
  type: 'my-custom-element',
  config: {
    type: 'my-custom-element',
    name: 'My Custom Element',
    icon: <span>✨</span>,
    description: 'A custom form element',
    defaultOptions: {
      label: 'Custom Field',
      required: false,
    },
    // ... other configurations
  },
  render: MyCustomElement,
  getDefaultValue: () => '',
  validate: (value, field) => {
    // Your validation logic
    return undefined;
  },
};

// Register the element
formElementRegistry.register(myCustomElement);

export default MyCustomElement;
```

## Validation

The form system includes built-in validation that can be customized per field:

```tsx
{
  id: 'email',
  type: 'email',
  label: 'Email',
  required: true,
  pattern: '^[^\s@]+@[^\s@]+\.[^\s@]+$',
  errorMessages: {
    required: 'Email is required',
    pattern: 'Please enter a valid email address'
  }
}
```

## Database Integration

Each form element includes a database configuration that defines how the field data should be stored:

```tsx
database: {
  collection: 'form_text_inputs',
  schema: {
    type: 'string',
    required: true
  },
  indexes: [
    {
      fields: ['value'],
      options: {
        unique: true
      }
    }
  ]
}
```

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT
