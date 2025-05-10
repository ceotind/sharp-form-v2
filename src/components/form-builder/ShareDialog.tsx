import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";

interface ShareDialogProps {
  isOpen: boolean;
  shareLink: string;
  onClose: () => void;
  onCopy: () => void;
}

export function ShareDialog({ 
  isOpen, 
  shareLink, 
  onClose, 
  onCopy 
}: ShareDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Form</DialogTitle>
          <DialogDescription>
            Anyone with this link can view and submit the form
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2">
          <Input
            value={shareLink}
            readOnly
            className="flex-1"
          />
          <Button 
            variant="outline" 
            size="icon"
            onClick={onCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}