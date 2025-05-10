import { Button } from "@/components/ui/button";
import { Eye, BarChart2, Share2, Save, Trash, FileText } from "lucide-react";

interface FormHeaderProps {
  formTitle: string;
  selectedFormId: string | null;
  isPublishing: boolean;
  onView: (formId: string) => void;
  onShare: (formId: string) => void;
  onDelete: (formId: string) => void;
  onPublish: () => void;
  onUpdate: () => void;
}

export function FormHeader({
  formTitle,
  selectedFormId,
  isPublishing,
  onView,
  onShare,
  onDelete,
  onPublish,
  onUpdate,
}: FormHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold">{formTitle}</h1>
        {selectedFormId && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(selectedFormId)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(selectedFormId)}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(selectedFormId)}
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant={isPublishing ? "default" : "outline"}
          size="sm"
          onClick={onPublish}
        >
          {isPublishing ? (
            <BarChart2 className="w-4 h-4 mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isPublishing ? "Published" : "Publish"}
        </Button>
        <Button variant="outline" size="sm" onClick={onUpdate}>
          <FileText className="w-4 h-4 mr-2" />
          Update
        </Button>
      </div>
    </div>
  );
}