"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { deleteProduct } from "../_actions/index";

interface DeleteProductDialogProps {
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
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  product,
}: DeleteProductDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const hasAssociations =
    (product._count?.contents || 0) > 0 ||
    (product._count?.userProducts || 0) > 0;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteProduct(product.id);

      toast({
        title: "Produto excluído",
        description: `O produto ${product.name} foi excluído com sucesso.`,
      });

      onOpenChange(false);
      router.refresh();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Produto</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o produto{" "}
            <strong>{product.name}</strong>?
          </DialogDescription>
        </DialogHeader>

        {hasAssociations && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-amber-500/10 text-amber-600 my-2">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
