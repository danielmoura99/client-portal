/* eslint-disable @typescript-eslint/no-unused-vars */
// app/(admin)/admin/contents/_components/simple-delete-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface SimpleDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  title: string;
}

export function SimpleDeleteDialog({
  open,
  onOpenChange,
  onDelete,
  title,
}: SimpleDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Simular uma operação de exclusão
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mostrar o toast
      toast({
        title: "Conteúdo removido",
        description: `O conteúdo foi removido com sucesso.`,
      });

      // Fechar o diálogo e notificar o componente pai
      onOpenChange(false);
      onDelete();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir o conteúdo",
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
          <DialogTitle>Teste de Exclusão</DialogTitle>
        </DialogHeader>

        <p className="py-4">Este é um teste de diálogo para excluir: {title}</p>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
