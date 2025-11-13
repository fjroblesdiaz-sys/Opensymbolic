import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SaveExperimentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { name: string; description: string }) => void;
}

export function SaveExperimentDialog({
  open,
  onOpenChange,
  onSave,
}: SaveExperimentDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name, description });
      setName("");
      setDescription("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-save-experiment">
        <DialogHeader>
          <DialogTitle>Guardar Experimento</DialogTitle>
          <DialogDescription>
            Dale un nombre y descripción a tu experimento para guardarlo en la biblioteca
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="experiment-name">Nombre del Experimento</Label>
            <Input
              id="experiment-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mi experimento de conceptrones"
              data-testid="input-experiment-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="experiment-description">Descripción (opcional)</Label>
            <Textarea
              id="experiment-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del experimento..."
              className="resize-none"
              data-testid="textarea-experiment-description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-save">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()} data-testid="button-confirm-save">
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
