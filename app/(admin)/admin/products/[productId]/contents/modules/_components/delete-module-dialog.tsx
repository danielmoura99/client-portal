"use client";

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
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { deleteModule } from "../_actions";

interface DeleteModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: {
    id: string;
    title: string;
    hasContents?: boolean;
  };
  productId: string;
  onDeleted: () => void;
}

export function DeleteModuleDialog({
  open,
  onOpenChange,
  module,
  productId,
  onDeleted,
}: DeleteModuleDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteModule(module.id, productId);

      toast({
        title: "Módulo excluído",
        description: `O módulo ${module.title} foi excluído com sucesso.`,
      });

      onOpenChange(false);
      onDeleted();
    } catch (error) {
      console.error("Erro ao excluir módulo:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao excluir o módulo",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Módulo</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o módulo{" "}
            <strong>{module.title}</strong>?
          </DialogDescription>
        </DialogHeader>

        {module.hasContents && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-amber-500/10 text-amber-600 my-2">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div className="text-sm">
              Este módulo não pode ser excluído porque possui conteúdos
              associados. Remova os conteúdos do módulo antes de excluí-lo.
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || module.hasContents}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir Módulo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
