"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { createModule, updateModule } from "../_actions";

// Schema para validação do formulário
const moduleFormSchema = z.object({
  title: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres",
  }),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

type ModuleFormValues = z.infer<typeof moduleFormSchema>;

interface ModuleFormProps {
  productId: string;
  initialData?: {
    id: string;
    title: string;
    description?: string | null;
    sortOrder: number;
  };
}

export function ModuleForm({ productId, initialData }: ModuleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description || "",
          sortOrder: initialData.sortOrder,
        }
      : {
          title: "",
          description: "",
          sortOrder: 0,
        },
  });

  const onSubmit = async (values: ModuleFormValues) => {
    try {
      setIsSubmitting(true);

      if (initialData) {
        // Atualizar módulo existente
        await updateModule(initialData.id, productId, values);
        toast({
          title: "Módulo atualizado",
          description: "O módulo foi atualizado com sucesso.",
        });
      } else {
        // Criar novo módulo
        await createModule(productId, values);
        toast({
          title: "Módulo criado",
          description: "O módulo foi criado com sucesso.",
        });
      }

      // Redirecionar para a página de conteúdos do produto
      router.push(`/admin/products/${productId}/contents`);
      router.refresh();
    } catch (error) {
      console.error("Erro ao salvar módulo:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao salvar o módulo",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título do módulo" {...field} />
              </FormControl>
              <FormDescription>Nome do módulo</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o módulo..."
                  {...field}
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormDescription>Descrição do módulo</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordem</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormDescription>
                Ordem de exibição (números menores são exibidos primeiro)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/admin/products/${productId}/contents`)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Atualizando..." : "Criando..."}
              </>
            ) : initialData ? (
              "Atualizar Módulo"
            ) : (
              "Criar Módulo"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
