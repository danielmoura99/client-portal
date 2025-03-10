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
import { toast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";
import { resetUserPassword } from "../_actions";

// Schema para validação do formulário
const passwordFormSchema = z
  .object({
    password: z.string().min(6, {
      message: "A senha deve ter pelo menos 6 caracteres",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

interface ResetPasswordFormProps {
  userId: string;
  userName: string;
}

export function ResetPasswordForm({
  userId,
  userName,
}: ResetPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Função para gerar uma senha aleatória
  const generateRandomPassword = () => {
    setIsGenerating(true);

    // Criar uma senha aleatória com 8 caracteres
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    form.setValue("password", password, { shouldValidate: true });
    form.setValue("confirmPassword", password, { shouldValidate: true });

    setIsGenerating(false);
  };

  const onSubmit = async (values: PasswordFormValues) => {
    try {
      setIsSubmitting(true);

      // Chamar a server action para resetar a senha
      await resetUserPassword(userId, values.password);

      toast({
        title: "Senha resetada",
        description: `A senha de ${userName} foi alterada com sucesso.`,
      });

      // Redirecionar para a lista de usuários
      router.push("/admin/users");
      router.refresh();
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao resetar a senha",
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
            Definir nova senha
          </h2>
          <p className="text-sm text-zinc-400">
            Defina uma nova senha para o usuário {userName}.
          </p>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nova Senha</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateRandomPassword}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <FormDescription>Mínimo de 6 caracteres</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Senha</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
              "Resetar Senha"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
