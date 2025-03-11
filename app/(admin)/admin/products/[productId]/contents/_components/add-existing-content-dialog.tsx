// app/(admin)/admin/products/[productId]/contents/_components/add-existing-content-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { addExistingContentsToProduct } from "../_actions";

interface Content {
  id: string;
  title: string;
  type: string;
  path: string;
  productId: string;
  product: {
    name: string;
  };
}

interface AddExistingContentDialogProps {
  productId: string;
}

export function AddExistingContentDialog({
  productId,
}: AddExistingContentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contents, setContents] = useState<Content[]>([]);
  const [selectedContents, setSelectedContents] = useState<string[]>([]);
  const router = useRouter();

  // Carregar conteúdos disponíveis quando o diálogo for aberto
  useEffect(() => {
    if (open) {
      const fetchContents = async () => {
        try {
          setIsLoading(true);
          const response = await fetch("/api/admin/contents/available");
          if (!response.ok) throw new Error("Falha ao carregar conteúdos");
          const data = await response.json();
          // Filtrar conteúdos que já não pertencem ao produto atual
          const filteredContents = data.contents.filter(
            (content: Content) => content.productId !== productId
          );
          setContents(filteredContents);
        } catch (error) {
          console.error("Erro ao carregar conteúdos:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os conteúdos disponíveis",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchContents();
    } else {
      // Limpar seleção quando o diálogo for fechado
      setSelectedContents([]);
    }
  }, [open, productId]);

  // Filtrar conteúdos com base na pesquisa
  const filteredContents = contents.filter(
    (content) =>
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleContent = (contentId: string) => {
    setSelectedContents((prev) =>
      prev.includes(contentId)
        ? prev.filter((id) => id !== contentId)
        : [...prev, contentId]
    );
  };

  const handleAddContents = async () => {
    if (selectedContents.length === 0) {
      toast({
        title: "Nenhum conteúdo selecionado",
        description: "Selecione pelo menos um conteúdo para adicionar",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await addExistingContentsToProduct(productId, selectedContents);
      toast({
        title: "Conteúdos adicionados",
        description: `${selectedContents.length} conteúdo(s) adicionado(s) ao produto`,
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Erro ao adicionar conteúdos:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível adicionar os conteúdos",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Conteúdo Existente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Adicionar Conteúdos Existentes</DialogTitle>
          <DialogDescription>
            Selecione conteúdos existentes para adicionar a este produto
          </DialogDescription>
        </DialogHeader>

        <div className="relative my-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar conteúdos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex-1 overflow-y-auto border border-zinc-800 rounded-md p-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              {contents.length === 0
                ? "Não há conteúdos disponíveis para adicionar"
                : "Nenhum conteúdo encontrado com os critérios de busca"}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredContents.map((content) => (
                <div
                  key={content.id}
                  className="flex items-center space-x-2 p-2 hover:bg-zinc-800/30 rounded-md"
                >
                  <Checkbox
                    id={`content-${content.id}`}
                    checked={selectedContents.includes(content.id)}
                    onCheckedChange={() => handleToggleContent(content.id)}
                  />
                  <div className="flex-1 overflow-hidden">
                    <label
                      htmlFor={`content-${content.id}`}
                      className="cursor-pointer flex flex-col"
                    >
                      <span className="font-medium text-zinc-200 truncate">
                        {content.title}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {content.product.name} • {content.type}
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          <div className="flex justify-between w-full">
            <div className="text-sm text-zinc-400">
              {selectedContents.length} conteúdo(s) selecionado(s)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddContents}
                disabled={selectedContents.length === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  "Adicionar Selecionados"
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
