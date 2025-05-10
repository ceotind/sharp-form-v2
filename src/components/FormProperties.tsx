import React from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Check, X } from 'lucide-react';

interface FormPropertiesProps {
  formTitle: string;
  formDescription: string;
  customSlug: string;
  isSlugAvailable: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onCustomSlugChange: (slug: string) => void;
}

const FormProperties: React.FC<FormPropertiesProps> = ({
  formTitle,
  formDescription,
  customSlug,
  isSlugAvailable,
  onTitleChange,
  onDescriptionChange,
  onCustomSlugChange,
}) => {
  // Function to sanitize the slug
  const sanitizeSlug = (input: string) => {
    return input
      .toLowerCase() // Convert to lowercase
      .replace(/[^a-z0-9-]/g, '-') // Replace any non-alphanumeric characters with hyphens
      .replace(/-+/g, '-') // Replace multiple consecutive hyphens with a single hyphen
      .replace(/^-+|-+$/g, ''); // Remove hyphens from the beginning and end
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Form Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Form Title <span className="text-red-500">*</span>
          </label>
          <Input
            value={formTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full"
            placeholder="Enter form title"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Form Description</label>
          <Textarea
            value={formDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="w-full h-20"
            placeholder="Enter form description"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Custom URL</label>
          <div className="relative">
            <Input
              value={customSlug}
              onChange={(e) => onCustomSlugChange(sanitizeSlug(e.target.value))}
              className="w-full pr-24"
              placeholder="Enter custom URL"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {customSlug && (
                <Badge
                  variant={isSlugAvailable ? 'success' : 'destructive'}
                  className="flex items-center gap-1"
                >
                  {isSlugAvailable ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Available</span>
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3" />
                      <span>Not available</span>
                    </>
                  )}
                </Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Enter a custom URL for your form (e.g., my-form). Only letters, numbers, and hyphens are allowed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormProperties;
