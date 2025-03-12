// app/(admin)/admin/contents/_components/custom-delete-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface CustomDeleteModalProps {
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

export function CustomDeleteModal({
  open,
  onOpenChange,
  content,
  productId,
  onDeleted,
}: CustomDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteCompletelyChecked, setDeleteCompletelyChecked] = useState(false);

  // Fechar o modal quando ESC é pressionado
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) {
        onOpenChange(false);
      }
    };

    if (open) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open, onOpenChange, isDeleting]);

  // Prevenir scroll do body quando o modal está aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Determinar a URL da API com base na opção selecionada
      const endpoint = deleteCompletelyChecked
        ? `/api/admin/contents/delete/${content.id}`
        : productId && content.productContentId
          ? `/api/admin/products/${productId}/contents/${content.productContentId}`
          : `/api/admin/contents/delete/${content.id}`;

      console.log("Enviando requisição DELETE para:", endpoint);

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
          : "Conteúdo removido",
        description: deleteCompletelyChecked
          ? `O conteúdo ${content.title} foi excluído completamente do sistema.`
          : `O conteúdo ${content.title} foi removido.`,
      });

      // Importante: guardar o ID
      const contentId = content.id;

      // Primeiro fechar o modal
      onOpenChange(false);

      // Informar que foi excluído
      setTimeout(() => {
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

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => !isDeleting && onOpenChange(false)}
      />

      {/* Modal */}
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-background rounded-lg border shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-2">Excluir Conteúdo</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {deleteCompletelyChecked
            ? "Tem certeza que deseja excluir permanentemente o conteúdo"
            : "Tem certeza que deseja remover o conteúdo"}{" "}
          <strong>{content.title}</strong>?
        </p>

        <div className="mb-6">
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

        <div className="flex justify-end gap-3">
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
              "Remover"
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
