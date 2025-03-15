// app/(admin)/admin/products/_components/product-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ProductType } from "@prisma/client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { createProduct, updateProduct } from "../_actions/index";
import { Loader2 } from "lucide-react";

// Schema para validação do formulário
const productFormSchema = z.object({
  name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres",
  }),
  type: z.enum(["COURSE", "TOOL", "EVALUATION"], {
    required_error: "Selecione o tipo de produto",
  }),
  slug: z
    .string()
    .min(3, { message: "O slug deve ter pelo menos 3 caracteres" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "O slug deve conter apenas letras minúsculas, números e hífens",
    }),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: ProductFormValues & {
    id: string;
    courseId?: number; // Adicionamos courseId como opcional
  };
}

export function ProductForm({ initialData }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Definir valores padrão
  const defaultValues: Partial<ProductFormValues> = initialData
    ? {
        name: initialData.name,
        description: initialData.description,
        type: initialData.type,
        slug: initialData.slug,
      }
    : {
        name: "",
        description: "",
        type: undefined,
        slug: "",
      };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  // Gerar slug automaticamente com base no nome
  const generateSlug = () => {
    const name = form.getValues("name");
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove caracteres especiais
        .replace(/\s+/g, "-") // Substitui espaços por hífens
        .replace(/--+/g, "-"); // Remove hífens duplicados

      form.setValue("slug", slug, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setIsSubmitting(true);

      if (initialData) {
        // Atualizar produto existente
        await updateProduct(initialData.id, values);
        toast({
          title: "Produto atualizado",
          description: "O produto foi atualizado com sucesso.",
        });
      } else {
        // Criar novo produto
        await createProduct(values);
        toast({
          title: "Produto criado",
          description: "O produto foi criado com sucesso.",
        });
      }

      // Redirecionar para a lista de produtos
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao salvar o produto",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nome do produto"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      // Se o slug estiver vazio, gerar automaticamente
                      if (!form.getValues("slug")) {
                        setTimeout(generateSlug, 500);
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>Nome do curso ou ferramenta</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="COURSE">Curso</SelectItem>
                      <SelectItem value="TOOL">Ferramenta</SelectItem>
                      <SelectItem value="EVALUATION">Avaliação</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Tipo de produto</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <FormControl>
                        <Input placeholder="slug-do-produto" {...field} />
                      </FormControl>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateSlug}
                      className="mb-[2px]"
                    >
                      Gerar
                    </Button>
                  </div>
                  <FormDescription>
                    Identificador único usado nas URLs
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {initialData && initialData.courseId !== undefined && (
              <FormItem>
                <FormLabel>Course ID</FormLabel>
                <FormControl>
                  <Input type="text" value={initialData.courseId} disabled />
                </FormControl>
                <FormDescription>
                  Identificador único do curso (gerado automaticamente)
                </FormDescription>
              </FormItem>
            )}
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva o produto..."
                    {...field}
                    className="min-h-[120px]"
                  />
                </FormControl>
                <FormDescription>
                  Descrição detalhada do produto
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/products")}
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
                "Atualizar Produto"
              ) : (
                "Criar Produto"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
