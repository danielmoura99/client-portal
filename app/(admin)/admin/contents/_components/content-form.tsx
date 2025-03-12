/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(admin)/admin/contents/_components/content-form.tsx
"use client";

import { useState, useRef, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, Trash } from "lucide-react";
import { Img } from "@react-email/components";

// Schema para validação do formulário
const contentFormSchema = z.object({
  title: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres",
  }),
  description: z.string().optional(),
  type: z.string({
    required_error: "Selecione o tipo de conteúdo",
  }),
  productId: z.string({
    required_error: "Selecione um produto",
  }),
  moduleId: z.string().optional(),
  path: z.string().min(1, {
    message: "O caminho/URL do arquivo é obrigatório",
  }),
  sortOrder: z.coerce.number().default(0),
});

type ContentFormValues = z.infer<typeof contentFormSchema>;

interface ContentFormProps {
  initialData?: ContentFormValues & { id: string };
  products: any[];
  modules: any[];
  defaultProductId?: string;
  productContents?: {
    productId: string;
    moduleId: string | null;
    sortOrder: number;
  }[];
}

export function ContentForm({
  initialData,
  products,
  modules,
  defaultProductId = "",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  productContents = [],
}: ContentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Definir valores padrão
  const defaultValues: Partial<ContentFormValues> = initialData
    ? {
        title: initialData.title,
        description: initialData.description || "",
        type: initialData.type,
        productId: initialData.productId,
        moduleId: initialData.moduleId || "",
        path: initialData.path,
        sortOrder: initialData.sortOrder || 0,
      }
    : {
        title: "",
        description: "",
        type: "file", // Padrão para arquivo
        productId: defaultProductId,
        moduleId: "",
        path: "",
        sortOrder: 0,
      };

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues,
  });

  // Filtrar módulos com base no produto selecionado
  const selectedProductId = form.watch("productId");
  const filteredModules = modules.filter(
    (module) => module.productId === selectedProductId
  );

  // Se for um arquivo de imagem, mostrar prévia
  useEffect(() => {
    if (initialData && initialData.path && !selectedFile) {
      // Se for uma URL externa, verificar se é uma imagem
      if (initialData.path.match(/\.(jpeg|jpg|gif|png)$/i)) {
        setPreviewUrl(initialData.path);
      }
    }
  }, [initialData]);

  // Manipular seleção de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Criar URL para prévia, se for imagem
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }

      // Determinar o tipo com base na extensão
      const fileName = file.name.toLowerCase();
      let contentType = "file";

      if (fileName.endsWith(".mp4") || fileName.endsWith(".webm")) {
        contentType = "video";
      }

      // Atualizar o formulário
      form.setValue("title", file.name.split(".")[0].replace(/_/g, " "));
      form.setValue("type", contentType);
      form.setValue("path", `contents/${selectedProductId}/${file.name}`);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    // Não limpar o campo path, para manter o valor original em caso de edição
  };

  const onSubmit = async (values: ContentFormValues) => {
    try {
      setIsSubmitting(true);

      // Criar FormData para upload de arquivo
      const formData = new FormData();

      const moduleId = values.moduleId === "none" ? "" : values.moduleId;

      // Adicionar dados do formulário
      Object.entries({ ...values, moduleId }).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Adicionar arquivo, se selecionado
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      // Enviar para a API
      const url = initialData
        ? `/api/admin/contents/${initialData.id}`
        : "/api/admin/contents";

      const response = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao salvar conteúdo");
      }

      toast({
        title: initialData ? "Conteúdo atualizado" : "Conteúdo criado",
        description: initialData
          ? "O conteúdo foi atualizado com sucesso."
          : "O conteúdo foi criado com sucesso.",
      });

      // Redirecionar para a lista de conteúdos
      router.push("/admin/contents");
      router.refresh();
    } catch (error) {
      console.error("Erro ao salvar conteúdo:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao salvar o conteúdo",
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
          {/* Produto e Módulo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      // Limpar a seleção de módulo ao mudar de produto
                      if (value !== field.value) {
                        form.setValue("moduleId", "");
                      }
                      field.onChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Produto ao qual este conteúdo pertence
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="moduleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Módulo (opcional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um módulo (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Nenhum módulo</SelectItem>
                      {filteredModules.map((moduleItem) => (
                        <SelectItem key={moduleItem.id} value={moduleItem.id}>
                          {moduleItem.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Módulo opcional para organizar o conteúdo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Título e Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título do conteúdo" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nome que será exibido ao usuário
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Conteúdo</FormLabel>
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
                      <SelectItem value="file">Arquivo</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="article">Artigo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Tipo de conteúdo</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Upload de arquivo */}
          <div className="border border-dashed border-zinc-700 rounded-lg p-6">
            <div className="flex flex-col items-center justify-center space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl ? (
                <div className="relative">
                  <Img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-40 max-w-full rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 rounded-full p-1"
                    onClick={clearSelectedFile}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <UploadCloud className="h-10 w-10 text-zinc-500" />
              )}

              <div className="text-center">
                <p className="text-zinc-300">
                  {selectedFile ? (
                    <>
                      Arquivo selecionado:{" "}
                      <span className="font-medium">{selectedFile.name}</span>
                    </>
                  ) : (
                    <>
                      {initialData ? (
                        <>
                          Arquivo atual:{" "}
                          <span className="font-medium">
                            {initialData.path.split("/").pop()}
                          </span>
                          <span className="block mt-1 text-sm text-zinc-500">
                            Clique abaixo para substituir
                          </span>
                        </>
                      ) : (
                        <>
                          Arraste e solte ou{" "}
                          <span
                            className="text-blue-500 cursor-pointer"
                            onClick={triggerFileInput}
                          >
                            selecione um arquivo
                          </span>
                        </>
                      )}
                    </>
                  )}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Suporta arquivos PDF, Excel, vídeos e outros
                </p>
              </div>

              {!selectedFile && initialData && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                >
                  {initialData ? "Substituir arquivo" : "Selecionar arquivo"}
                </Button>
              )}

              {selectedFile && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearSelectedFile}
                >
                  Remover arquivo
                </Button>
              )}
            </div>
          </div>

          {/* Caminho/URL */}
          <FormField
            control={form.control}
            name="path"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caminho/URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="caminho/do/arquivo.pdf ou URL"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Caminho do arquivo no servidor ou URL externa (para vídeos)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Descrição */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descrição do conteúdo..."
                    {...field}
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormDescription>
                  Descrição adicional do conteúdo
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ordem */}
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ordem de exibição</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="1" {...field} />
                </FormControl>
                <FormDescription>
                  Ordem de exibição do conteúdo (números menores são exibidos
                  primeiro)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/contents")}
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
                "Atualizar Conteúdo"
              ) : (
                "Criar Conteúdo"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
