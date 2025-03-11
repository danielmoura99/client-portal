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
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface DeleteContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: {
    id: string;
    title: string;
    type: string;
    productContentId: string; // ID da relação na tabela intermediária
  };
  productId: string;
  onDeleted: (contentId: string) => void;
}

export function DeleteContentDialog({
  open,
  onOpenChange,
  content,
  productId,
  onDeleted,
}: DeleteContentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteCompletelyChecked, setDeleteCompletelyChecked] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Determinar a URL da API com base na opção selecionada
      const endpoint = deleteCompletelyChecked
        ? `/api/admin/contents/${content.id}`
        : `/api/admin/products/${productId}/contents/${content.productContentId}`;

      // Fazer a requisição para remover a associação ou excluir completamente o conteúdo
      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao excluir conteúdo");
      }

      toast({
        title: deleteCompletelyChecked
          ? "Conteúdo excluído permanentemente"
          : "Conteúdo removido do produto",
        description: deleteCompletelyChecked
          ? `O conteúdo ${content.title} foi excluído completamente do sistema.`
          : `O conteúdo ${content.title} foi removido deste produto.`,
      });

      onOpenChange(false);
      onDeleted(content.id);
    } catch (error) {
      console.error("Erro ao excluir conteúdo:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao excluir o conteúdo",
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
          <DialogTitle>Remover Conteúdo</DialogTitle>
          <DialogDescription>
            {deleteCompletelyChecked
              ? "Tem certeza que deseja excluir permanentemente o conteúdo"
              : "Tem certeza que deseja remover o conteúdo deste produto"}{" "}
            <strong>{content.title}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="delete-completely"
              checked={deleteCompletelyChecked}
              onCheckedChange={(checked) =>
                setDeleteCompletelyChecked(checked === true)
              }
            />
            <label
              htmlFor="delete-completely"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Excluir conteúdo permanentemente
            </label>
          </div>

          {deleteCompletelyChecked && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md flex gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-500">
                Esta ação é irreversível e excluirá completamente este conteúdo
                do sistema, incluindo todos os relacionamentos com outros
                produtos.
              </p>
            </div>
          )}
        </div>

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
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {deleteCompletelyChecked ? "Excluindo..." : "Removendo..."}
              </>
            ) : deleteCompletelyChecked ? (
              "Excluir Permanentemente"
            ) : (
              "Remover do Produto"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
