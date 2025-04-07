// app/(portal)/requests/_components/request-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { createRequest } from "../_actions";

const requestSchema = z.object({
  type: z.enum(
    [
      "EVALUATION_APPROVAL",
      "START_DATE_CHANGE",
      "WITHDRAWAL",
      "PLATFORM_ISSUE",
      "CAPITAL_REQUEST",
      "GENERAL",
    ],
    {
      required_error: "Selecione o tipo de solicitação",
    }
  ),
  description: z
    .string()
    .min(10, "A descrição deve ter no mínimo 10 caracteres"),
});

type RequestFormData = z.infer<typeof requestSchema>;

export function RequestForm() {
  const router = useRouter();
  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });

  async function onSubmit(data: RequestFormData) {
    try {
      await createRequest({
        type: data.type,
        description: data.description,
      });

      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação foi enviada com sucesso.",
      });

      router.push("/requests");
      router.refresh();
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua solicitação.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Solicitação</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="EVALUATION_APPROVAL">
                    Aprovação de Avaliação
                  </SelectItem>
                  <SelectItem value="START_DATE_CHANGE">
                    Mudança de Data
                  </SelectItem>
                  <SelectItem value="WITHDRAWAL">Saque de Recursos</SelectItem>
                  <SelectItem value="PLATFORM_ISSUE">
                    Problema na Plataforma
                  </SelectItem>
                  <SelectItem value="CAPITAL_REQUEST">
                    Solicitar de Capital(MGT)
                  </SelectItem>
                  <SelectItem value="GENERAL">Outras Solicitações</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Descreva sua solicitação em detalhes..."
                  className="min-h-[150px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit">Enviar Solicitação</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
