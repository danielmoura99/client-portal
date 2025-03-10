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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Shield } from "lucide-react";
import { updateUserRole } from "../_actions";

// Schema para validação do formulário
const roleFormSchema = z.object({
  role: z.enum(["USER", "ADMIN", "SUPPORT"], {
    required_error: "Selecione um nível de permissão",
  }),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
  userId: string;
  userName: string;
  currentRole: string;
}

export function RoleForm({ userId, userName, currentRole }: RoleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      role: currentRole as "USER" | "ADMIN" | "SUPPORT",
    },
  });

  const onSubmit = async (values: RoleFormValues) => {
    // Se a role não mudou, não fazer nada
    if (values.role === currentRole) {
      toast({
        title: "Sem alteração",
        description:
          "A permissão selecionada é a mesma já atribuída ao usuário.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Chamar a server action para atualizar a role
      await updateUserRole(userId, values.role);

      toast({
        title: "Permissão alterada",
        description: `A permissão de ${userName} foi alterada para ${values.role}.`,
      });

      // Redirecionar para a lista de usuários
      router.push("/admin/users");
      router.refresh();
    } catch (error) {
      console.error("Erro ao alterar permissão:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Erro ao alterar a permissão",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2 mb-4">
          <h2 className="text-lg font-medium text-zinc-100">
            Nível de Permissão
          </h2>
          <p className="text-sm text-zinc-400">
            Escolha o nível de acesso para o usuário {userName}.
          </p>
        </div>

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Permissão</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma permissão" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USER">Usuário</SelectItem>
                  <SelectItem value="SUPPORT">Suporte</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                <span className="flex items-center mt-2">
                  <Shield className="h-4 w-4 mr-1 text-zinc-500" />
                  <span className="text-xs text-zinc-500">
                    {field.value === "ADMIN"
                      ? "Acesso total ao sistema e painel administrativo"
                      : field.value === "SUPPORT"
                        ? "Acesso para gerenciar solicitações e conteúdos"
                        : "Acesso básico às funcionalidades do sistema"}
                  </span>
                </span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/users")}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Salvar Permissão"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
