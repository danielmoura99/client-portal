// app/(admin)/admin/products/_components/custom-delete-product-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
// Importar a action em vez de usar fetch
import { deleteProduct } from "../_actions/index";

interface CustomDeleteProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    name: string;
    _count?: {
      contents?: number;
      userProducts?: number;
    };
  };
  onDeleted: () => void;
}

export function CustomDeleteProductModal({
  open,
  onOpenChange,
  product,
  onDeleted,
}: CustomDeleteProductModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Verificar se o produto tem associações
  const hasAssociations =
    (product._count?.contents || 0) > 0 ||
    (product._count?.userProducts || 0) > 0;

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

      // Chamar a server action em vez de fazer fetch
      await deleteProduct(product.id);

      toast({
        title: "Produto excluído",
        description: `O produto ${product.name} foi excluído com sucesso.`,
      });

      // Primeiro fechar o modal
      onOpenChange(false);

      // Depois notificar que foi excluído
      setTimeout(() => {
        onDeleted();
      }, 100);
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao excluir o produto",
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
        <h2 className="text-lg font-semibold mb-2">Excluir Produto</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Tem certeza que deseja excluir o produto{" "}
          <strong>{product.name}</strong>?
        </p>

        {hasAssociations && (
          <div className="mb-6 flex items-start gap-2 p-3 rounded-md bg-amber-500/10 text-amber-600">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div className="text-sm">
              Este produto não pode ser excluído porque possui:
              <ul className="list-disc list-inside mt-1 space-y-1">
                {(product._count?.contents || 0) > 0 && (
                  <li>{product._count?.contents} conteúdo(s) associado(s)</li>
                )}
                {(product._count?.userProducts || 0) > 0 && (
                  <li>{product._count?.userProducts} usuário(s) com acesso</li>
                )}
              </ul>
              <p className="mt-2">
                Remova essas associações antes de excluir o produto.
              </p>
            </div>
          </div>
        )}

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
            disabled={isDeleting || hasAssociations}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir Produto"
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
