import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Palette, Type, CircleDot } from "lucide-react";

interface FormThemeProps {
  themeBackground: string;
  textColor: string;
  accentColor: string;
  onBackgroundChange: (color: string) => void;
  onTextColorChange: (color: string) => void;
  onAccentColorChange: (color: string) => void;
  onSave: () => void;
}

export function FormTheme({ 
  themeBackground,
  textColor,
  accentColor,
  onBackgroundChange,
  onTextColorChange,
  onAccentColorChange,
  onSave
}: FormThemeProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 space-y-1">
        <CardTitle className="text-base flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Theme Settings
        </CardTitle>
        <CardDescription className="text-xs">
          Customize the appearance of your form
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Color Settings */}
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="backgroundColor" className="text-xs flex items-center gap-2">
              <Palette className="w-3 h-3" />
              Background
            </Label>
            <div className="flex gap-2">
              <Input
                id="backgroundColor"
                type="color"
                value={themeBackground}
                onChange={(e) => onBackgroundChange(e.target.value)}
                className="w-8 h-8 p-0.5 rounded"
              />
              <Input
                type="text"
                value={themeBackground.toUpperCase()}
                onChange={(e) => onBackgroundChange(e.target.value)}
                className="flex-1 h-8 text-xs"
                placeholder="#FFFFFF"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="textColor" className="text-xs flex items-center gap-2">
              <Type className="w-3 h-3" />
              Text
            </Label>
            <div className="flex gap-2">
              <Input
                id="textColor"
                type="color"
                value={textColor}
                onChange={(e) => onTextColorChange(e.target.value)}
                className="w-8 h-8 p-0.5 rounded"
              />
              <Input
                type="text"
                value={textColor.toUpperCase()}
                onChange={(e) => onTextColorChange(e.target.value)}
                className="flex-1 h-8 text-xs"
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="accentColor" className="text-xs flex items-center gap-2">
              <CircleDot className="w-3 h-3" />
              Accent
            </Label>
            <div className="flex gap-2">
              <Input
                id="accentColor"
                type="color"
                value={accentColor}
                onChange={(e) => onAccentColorChange(e.target.value)}
                className="w-8 h-8 p-0.5 rounded"
              />
              <Input
                type="text"
                value={accentColor.toUpperCase()}
                onChange={(e) => onAccentColorChange(e.target.value)}
                className="flex-1 h-8 text-xs"
                placeholder="#3B82F6"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={onSave}
          className="w-full h-8 mt-2 text-xs"
          size="sm"
        >
          Apply Theme
        </Button>
      </CardContent>
    </Card>
  );
}