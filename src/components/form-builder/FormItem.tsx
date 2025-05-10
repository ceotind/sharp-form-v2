import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash } from "lucide-react";

interface FormItemProps {
  form: {
    id: string;
    title: string;
    createdAt: string | Date;
    responseCount?: number;
  };
  isActive: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export function FormItem({ form, onEdit, onDelete, onView, isActive }: FormItemProps) {
  const responseCount = form.responseCount || 0;
  const formDate = form.createdAt ? new Date(form.createdAt) : new Date();
  const formattedDate = formDate.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg mb-2 transition-colors ${
      isActive ? 'bg-[#0f51dd]/10 border-l-4 border-[#0f51dd]' : 'hover:bg-gray-50'
    }`}>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{form.title || 'Untitled Form'}</h4>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{formattedDate}</span>
          <span>{responseCount} responses</span>
        </div>
      </div>
      <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-md shadow-sm">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onView} 
          className="h-8 w-8 p-1.5 bg-white border hover:bg-gray-50 flex items-center justify-center" 
          title="View Form"
        >
          <Eye className="h-4 w-4 text-[#0f51dd]" />
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onEdit} 
          className="h-8 w-8 p-1.5 bg-white border hover:bg-gray-50 flex items-center justify-center" 
          title="Edit Form"
        >
          <Edit className="h-4 w-4 text-[#0f51dd]" />
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onDelete} 
          className="h-8 w-8 p-1.5 bg-white border hover:bg-red-50 flex items-center justify-center" 
          title="Delete Form"
        >
          <Trash className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}