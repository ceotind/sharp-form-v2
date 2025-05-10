import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Type, 
  AlignLeft, 
  List, 
  CheckSquare, 
  Circle, 
  Calendar,
  Mail,
  Phone,
  Link,
  Hash,
  FileText
} from "lucide-react";

interface FormElementsProps {
  onFieldSelect: (fieldType: string) => void;
}

export function FormElements({ onFieldSelect }: FormElementsProps) {
  const basicFields = [
    { icon: Type, label: "Short Text", type: "text" },
    { icon: AlignLeft, label: "Long Text", type: "textarea" },
    { icon: List, label: "Dropdown", type: "select" },
    { icon: CheckSquare, label: "Checkbox", type: "checkbox" },
    { icon: Circle, label: "Radio", type: "radio" },
    { icon: Calendar, label: "Date", type: "date" }
  ];

  const advancedFields = [
    { icon: Mail, label: "Email", type: "email" },
    { icon: Phone, label: "Phone", type: "tel" },
    { icon: Link, label: "URL", type: "url" },
    { icon: Hash, label: "Number", type: "number" },
    { icon: FileText, label: "File Upload", type: "file" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Elements</CardTitle>
        <CardDescription>
          Click to add elements to your form
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {basicFields.map((field) => (
                <Button
                  key={field.type}
                  variant="outline"
                  className="h-auto p-4 justify-start gap-3"
                  onClick={() => onFieldSelect(field.type)}
                >
                  <field.icon className="w-4 h-4" />
                  {field.label}
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {advancedFields.map((field) => (
                <Button
                  key={field.type}
                  variant="outline"
                  className="h-auto p-4 justify-start gap-3"
                  onClick={() => onFieldSelect(field.type)}
                >
                  <field.icon className="w-4 h-4" />
                  {field.label}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}