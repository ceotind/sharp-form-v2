import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FormField, Option, DropdownField, RadioField, CheckboxField } from '@/types/form';
import { Button } from '../ui/button';

interface FormElementEditorProps {
  isOpen: boolean;
  onClose: () => void;
  field: FormField;
  onSave: (updatedField: FormField) => void;
}

type FieldWithOptions = Required<DropdownField | RadioField | CheckboxField>;

function hasOptions(field: FormField): field is FieldWithOptions {
  return (field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox') 
    && 'options' in field 
    && Array.isArray(field.options);
}

function ensureFieldHasOptions(field: FormField): FieldWithOptions {
  if (hasOptions(field)) {
    return field;
  }
  return {
    ...field,
    type: field.type as FieldWithOptions['type'],
    options: [],
  } as FieldWithOptions;
}

export function FormElementEditor({ isOpen, onClose, field, onSave }: FormElementEditorProps) {
  // Initialize with proper options array if it's a field that should have options
  const initialField = React.useMemo(() => {
    if (field.type === 'dropdown' || field.type === 'radio' || (field.type === 'checkbox' && !field.checked)) {
      return ensureFieldHasOptions(field);
    }
    return field;
  }, [field]);

  const [editedField, setEditedField] = React.useState<FormField>(initialField);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    setEditedField(initialField);
  }, [initialField]);

  const validateField = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editedField.label.trim()) {
      newErrors.label = 'Label is required';
    }

    if (hasOptions(editedField)) {
      if (editedField.options.length === 0) {
        newErrors.options = 'At least one option is required';
      } else {
        editedField.options.forEach((option, index) => {
          if (!option.label.trim()) {
            newErrors[`option-${index}-label`] = 'Option label is required';
          }
          if (!option.value.trim()) {
            newErrors[`option-${index}-value`] = 'Option value is required';
          }
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateField()) {
      onSave(editedField);
      onClose();
    }
  };

  const addOption = () => {
    if (hasOptions(editedField)) {
      const newOption: Option = {
        id: crypto.randomUUID(),
        label: '',
        value: ''
      };
      setEditedField({
        ...editedField,
        options: [...editedField.options, newOption]
      });
    }
  };

  const removeOption = (index: number) => {
    if (hasOptions(editedField)) {
      const newOptions = [...editedField.options];
      newOptions.splice(index, 1);
      setEditedField({
        ...editedField,
        options: newOptions
      });
    }
  };

  const updateOption = (index: number, key: 'label' | 'value', value: string) => {
    if (hasOptions(editedField)) {
      const newOptions = [...editedField.options];
      newOptions[index] = { ...newOptions[index], [key]: value };
      setEditedField({
        ...editedField,
        options: newOptions
      });
    }
  };

  const handleChange = <K extends keyof FormField>(key: K, value: FormField[K]) => {
    setEditedField(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit {field.type.charAt(0).toUpperCase() + field.type.slice(1)} Field</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="label" className="flex items-center gap-1">
              Label <span className="text-red-500">*</span>
            </Label>
            <Input
              id="label"
              value={editedField.label}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('label', e.target.value)}
              className={errors.label ? 'border-red-500' : ''}
            />
            {errors.label && <p className="text-sm text-red-500">{errors.label}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedField.description || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('description', e.target.value)}
              placeholder="Optional description for this field"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="placeholder">Placeholder</Label>
            <Input
              id="placeholder"
              value={editedField.placeholder || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('placeholder', e.target.value)}
              placeholder="Enter placeholder text"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="helpText">Help Text</Label>
            <Input
              id="helpText"
              value={editedField.helpText || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('helpText', e.target.value)}
              placeholder="Additional help text for this field"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={editedField.required}
              onCheckedChange={(checked: boolean) => handleChange('required', checked)}
            />
            <Label htmlFor="required">Required</Label>
          </div>
          
          {hasOptions(editedField) && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Options</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                >
                  Add Option
                </Button>
              </div>
              {errors.options && <p className="text-sm text-red-500">{errors.options}</p>}
              <div className="space-y-3">
                {editedField.options.map((option, index) => (
                  <div key={option.id} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <Input
                        value={option.label}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOption(index, 'label', e.target.value)}
                        placeholder="Option label"
                        className={errors[`option-${index}-label`] ? 'border-red-500' : ''}
                      />
                      {errors[`option-${index}-label`] && (
                        <p className="text-sm text-red-500 mt-1">{errors[`option-${index}-label`]}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        value={option.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOption(index, 'value', e.target.value)}
                        placeholder="Option value"
                        className={errors[`option-${index}-value`] ? 'border-red-500' : ''}
                      />
                      {errors[`option-${index}-value`] && (
                        <p className="text-sm text-red-500 mt-1">{errors[`option-${index}-value`]}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
