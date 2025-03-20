// app/(admin)/admin/products/[productId]/contents/modules/_components/module-form.tsx
"use client";

import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Loader2, Calendar, Lock } from "lucide-react";
import { createModule, updateModule } from "../_actions";

// Schema para validação do formulário
const moduleFormSchema = z.object({
  title: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres",
  }),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  immediateAccess: z.boolean().default(true),
  releaseAfterDays: z.coerce
    .number()
    .int()
    .nullable()
    .refine((val) => val === null || val >= 1, {
      message: "Dias para liberação deve ser 1 ou maior",
    }),
});

type ModuleFormValues = z.infer<typeof moduleFormSchema>;

interface ModuleFormProps {
  productId: string;
  initialData?: {
    id: string;
    title: string;
    description?: string | null;
    sortOrder: number;
    immediateAccess?: boolean;
    releaseAfterDays?: number | null;
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
          immediateAccess: initialData.immediateAccess ?? true,
          releaseAfterDays: initialData.releaseAfterDays ?? null,
        }
      : {
          title: "",
          description: "",
          sortOrder: 0,
          immediateAccess: true,
          releaseAfterDays: null,
        },
  });

  // Observar mudanças no campo immediateAccess para resetar releaseAfterDays quando necessário
  const immediateAccess = form.watch("immediateAccess");

  // Resetar releaseAfterDays quando immediateAccess for alterado para true
  useEffect(() => {
    if (immediateAccess) {
      form.setValue("releaseAfterDays", null);
    }
  }, [immediateAccess, form]);

  const onSubmit = async (values: ModuleFormValues) => {
    try {
      setIsSubmitting(true);

      // Se o acesso for imediato, garantir que releaseAfterDays seja null
      if (values.immediateAccess) {
        values.releaseAfterDays = null;
      }

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

        <div className="bg-zinc-900/30 p-4 rounded-lg border border-zinc-800 space-y-6">
          <h3 className="text-lg font-medium text-zinc-100 mb-2">
            Configurações de Liberação
          </h3>

          <FormField
            control={form.control}
            name="immediateAccess"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-800 p-4">
                <div className="space-y-0.5">
                  <FormLabel className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    Acesso Imediato
                  </FormLabel>
                  <FormDescription>
                    Se ativado, o conteúdo será liberado assim que o aluno
                    adquirir o curso
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {!immediateAccess && (
            <FormField
              control={form.control}
              name="releaseAfterDays"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <FormLabel className="flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-amber-500" />
                      Liberar após (dias)
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="7"
                      {...field}
                      value={field.value === null ? "" : field.value}
                      onChange={(event) => {
                        const value =
                          event.target.value === ""
                            ? null
                            : parseInt(event.target.value, 10);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Quantidade de dias após a aquisição do curso para liberar
                    este módulo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="bg-zinc-800/30 border border-zinc-700/30 rounded-md p-3 text-xs text-zinc-400">
            <p className="flex items-center mb-2">
              <Calendar className="h-3 w-3 mr-1 text-blue-500" />
              <strong className="text-zinc-300">Como funciona:</strong>
            </p>
            <ul className="space-y-1 list-disc pl-5">
              <li>
                Módulos com <strong>acesso imediato</strong> são liberados assim
                que o aluno adquire o curso.
              </li>
              <li>
                Módulos <strong>sem acesso imediato</strong> serão liberados
                após o número de dias especificado a partir da data de
                aquisição.
              </li>
              <li>
                Se um módulo não tiver acesso imediato e nenhum prazo de
                liberação definido, ele permanecerá bloqueado indefinidamente.
              </li>
            </ul>
          </div>
        </div>

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
