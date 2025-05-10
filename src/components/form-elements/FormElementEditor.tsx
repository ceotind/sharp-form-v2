import React from 'react';
import { FormField } from '@/types/form';
import { formElementRegistry } from './registry/FormElementRegistry';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FormElementEditorProps {
  field: FormField | null;
  onClose: () => void;
  onUpdate: (updates: Partial<FormField>) => void;
}

export const FormElementEditor: React.FC<FormElementEditorProps> = ({
  field,
  onClose,
  onUpdate,
}) => {
  if (!field) return null;

  const elementConfig = formElementRegistry.getConfig(field.type);
  if (!elementConfig?.editor?.fields) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const updates: Partial<FormField> = {};

    elementConfig.editor.fields.forEach((editorField) => {
      if (editorField.type === 'checkbox') {
        updates[editorField.name] = formData.get(editorField.name) === 'on';
      } else if (editorField.type === 'number') {
        const value = formData.get(editorField.name);
        updates[editorField.name] = value ? Number(value) : undefined;
      } else {
        const value = formData.get(editorField.name);
        if (value) updates[editorField.name] = value.toString();
      }
    });

    onUpdate(updates);
    onClose();
  };

  return (
    <Dialog open={!!field} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit {elementConfig.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {elementConfig.editor.fields.map((editorField) => (
            <div key={editorField.name} className="space-y-2">
              <label
                htmlFor={editorField.name}
                className="block text-sm font-medium text-gray-700"
              >
                {editorField.label}
              </label>
              {editorField.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  id={editorField.name}
                  name={editorField.name}
                  defaultChecked={field[editorField.name]}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              ) : editorField.type === 'number' ? (
                <input
                  type="number"
                  id={editorField.name}
                  name={editorField.name}
                  defaultValue={field[editorField.name]}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              ) : (
                <input
                  type="text"
                  id={editorField.name}
                  name={editorField.name}
                  defaultValue={field[editorField.name]}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              )}
              {editorField.description && (
                <p className="mt-1 text-sm text-gray-500">{editorField.description}</p>
              )}
            </div>
          ))}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Changes
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
