import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface FormPropertiesProps {
  formTitle: string;
  formDescription: string;
  customSlug?: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onCustomSlugChange?: (slug: string) => void;
  isSlugAvailable?: boolean;
}

export function FormProperties({ 
  formTitle,
  formDescription,
  customSlug = "",
  onTitleChange,
  onDescriptionChange,
  onCustomSlugChange,
  isSlugAvailable
}: FormPropertiesProps) {
  const handleSlugChange = (value: string) => {
    // Allow only alphanumeric characters and hyphens
    const sanitizedSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    onCustomSlugChange?.(sanitizedSlug);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 space-y-1">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Form Properties
        </CardTitle>
        <CardDescription className="text-xs">
          Basic information about your form
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-xs">Form Title</Label>
          <Input
            id="title"
            value={formTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter form title"
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs">Description</Label>
          <Textarea
            id="description"
            value={formDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Enter form description"
            className="h-16 text-xs resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="customSlug" className="text-xs">Custom URL</Label>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500 whitespace-nowrap">
              forms/
            </div>
            <Input
              id="customSlug"
              value={customSlug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="custom-url"
              className="h-8 text-xs"
            />
          </div>
          {customSlug && (
            <p className={`text-xs mt-1 ${isSlugAvailable ? 'text-green-600' : 'text-red-600'}`}>
              {isSlugAvailable 
                ? 'This URL is available' 
                : 'This URL is already taken'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}