import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FormItem } from "./FormItem";
import { Plus, FileText, X } from "lucide-react";

interface SidebarProps {
  forms: any[];
  selectedFormId: string | null;
  sidebarOpen?: boolean;
  onNewForm: () => void;
  onEditForm: (id: string) => void;
  onDeleteForm: (id: string) => void;
  onViewForm: (id: string) => void;
  onClose?: () => void;
}

export function Sidebar({ 
  forms, 
  selectedFormId,
  sidebarOpen = true,
  onNewForm, 
  onEditForm, 
  onDeleteForm,
  onViewForm,
  onClose 
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-[280px] bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">Your Forms</h2>
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* New Form Button */}
        <div className="p-4 border-b">
          <Button 
            onClick={onNewForm} 
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            Create New Form
          </Button>
        </div>

        {/* Forms List */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {forms.map((form) => (
              <FormItem
                key={form.id}
                form={form}
                isActive={form.id === selectedFormId}
                onEdit={() => {
                  onEditForm(form.id);
                  onClose?.(); // Close sidebar on mobile after selection
                }}
                onDelete={() => onDeleteForm(form.id)}
                onView={() => {
                  onViewForm(form.id);
                  onClose?.(); // Close sidebar on mobile after selection
                }}
              />
            ))}

            {forms.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="bg-gray-50 rounded-lg p-6">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="font-medium text-gray-900 mb-1">No forms yet</h3>
                  <p className="text-sm text-gray-500 mb-4">Create your first form to get started</p>
                  <Button 
                    onClick={onNewForm}
                    variant="outline" 
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Form
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            {forms.length} form{forms.length !== 1 ? 's' : ''} created
          </p>
        </div>
      </aside>
    </>
  );
}