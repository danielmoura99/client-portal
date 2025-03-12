// app/(admin)/admin/contents/_components/delete-content-dialog.tsx
"use client";

import { useState, useEffect } from "react";
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
    productContentId?: string;
  };
  productId?: string;
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
  const [isDialogOpen, setIsDialogOpen] = useState(open);

  // Sincronizar o estado local com a propriedade open
  useEffect(() => {
    setIsDialogOpen(open);
  }, [open]);

  // Limpeza quando o componente é desmontado
  useEffect(() => {
    return () => {
      // Garantir que qualquer manipulação do DOM seja revertida
      document.body.style.overflow = "";

      // Remover qualquer classe que possa ter sido adicionada ao body
      document.body.classList.remove("overflow-hidden");

      // Remover qualquer elemento de overlay que possa ter ficado
      const overlays = document.querySelectorAll("[data-radix-overlay]");
      overlays.forEach((overlay) => {
        overlay.parentNode?.removeChild(overlay);
      });

      // Remover qualquer atributo aria que possa ter sido adicionado
      document.body.removeAttribute("aria-hidden");
    };
  }, []);

  const handleDelete = async () => {
    if (isDeleting) return; // Prevenir cliques duplos

    try {
      setIsDeleting(true);

      // Determinar a URL da API correta
      const endpoint = deleteCompletelyChecked
        ? `/api/admin/contents/delete/${content.id}`
        : productId && content.productContentId
          ? `/api/admin/products/${productId}/contents/${content.productContentId}`
          : `/api/admin/contents/delete/${content.id}`;

      console.log("Enviando DELETE para:", endpoint);

      // Fazer a requisição
      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao excluir conteúdo");
      }

      // Exibir notificação de sucesso
      toast({
        title: deleteCompletelyChecked
          ? "Conteúdo excluído permanentemente"
          : "Conteúdo removido",
        description: `O conteúdo ${content.title} foi ${deleteCompletelyChecked ? "excluído completamente" : "removido"}.`,
      });

      // Salvar o ID antes de fechar o diálogo
      const contentId = content.id;

      // Forçar o fechamento do diálogo
      setIsDialogOpen(false);
      onOpenChange(false);

      // SOLUÇÃO CRÍTICA: Restaurar o estado do DOM manualmente
      document.body.style.overflow = "";
      document.body.classList.remove("overflow-hidden");
      document.body.removeAttribute("aria-hidden");

      // Remover qualquer overlay persistente
      setTimeout(() => {
        const overlays = document.querySelectorAll("[data-radix-overlay]");
        overlays.forEach((overlay) => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
        });

        // Notificar o componente pai após limpar o DOM
        onDeleted(contentId);
      }, 100);
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

  // Se o dialog não estiver aberto, não renderize nada
  if (!isDialogOpen && !open) return null;

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(value) => {
        // Não permitir fechar durante a exclusão
        if (isDeleting && !value) return;

        // Atualizar estado local e notificar o pai
        setIsDialogOpen(value);
        onOpenChange(value);
      }}
    >
      <DialogContent
        onInteractOutside={(e) => {
          // Prevenir o fechamento ao clicar fora durante a exclusão
          if (isDeleting) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Excluir Conteúdo</DialogTitle>
          <DialogDescription>
            {deleteCompletelyChecked
              ? "Tem certeza que deseja excluir permanentemente o conteúdo"
              : "Tem certeza que deseja remover o conteúdo"}{" "}
            <strong>{content?.title || ""}</strong>?
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
              disabled={isDeleting}
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
                do sistema, incluindo todos os relacionamentos com produtos.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              // Forçar restauração do overflow
              document.body.style.overflow = "";
              document.body.classList.remove("overflow-hidden");

              // Fechar o diálogo
              setIsDialogOpen(false);
              onOpenChange(false);
            }}
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
              "Remover"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
