"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const registrationSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  cpf: z.string().min(11, "CPF inválido").max(14),
  phone: z.string().min(10, "Telefone inválido"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  address: z.string().min(5, "Endereço é obrigatório"),
  zipCode: z.string().min(8, "CEP inválido").max(9),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  consistencyLock: z.boolean().default(false),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  paymentId: string;
  paymentData: {
    type: "B3" | "FX"; // Novo campo
    paymentData: {
      platform: string;
      plan: string;
      customerEmail: string;
      customerName: string;
      customerDocument: string;
      hublaPaymentId: string;
    };
  };
}

async function checkExistingUser(email: string, document: string) {
  try {
    const response = await fetch(
      `/api/registration/check-user?email=${encodeURIComponent(
        email
      )}&document=${encodeURIComponent(document)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar dados do usuário");
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Erro ao verificar usuário:", error);
    return null;
  }
}

export function RegistrationForm({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  paymentId,
  paymentData,
}: RegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const router = useRouter();
  const { platform, plan, customerEmail, customerName, customerDocument } =
    paymentData.paymentData;

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: customerName || "",
      email: customerEmail || "",
      cpf: customerDocument || "",
      phone: "",
      birthDate: "",
      address: "",
      zipCode: "",
      startDate: "",
    },
  });

  useEffect(() => {
    async function loadUserData() {
      if (customerEmail || customerDocument) {
        const existingUser = await checkExistingUser(
          customerEmail,
          customerDocument
        );

        if (existingUser) {
          setIsExistingUser(true);
          form.reset({
            name: existingUser.name,
            email: existingUser.email,
            cpf: existingUser.document,
            phone: existingUser.phone || "",
            birthDate: "", // Data precisa ser formatada se vier do backend
            address: existingUser.address || "",
            zipCode: existingUser.zipCode || "",
            startDate: "",
          });
        }
      }
    }

    loadUserData();
  }, [customerEmail, customerDocument, form]);

  async function onSubmit(data: RegistrationFormData) {
    try {
      setIsLoading(true);

      const payload = {
        paymentId: paymentData.paymentData.hublaPaymentId,
        ...data,
        observation: `Trava de Consistência: ${data.consistencyLock ? "Sim" : "Não"}`,
        platform,
        plan,
        type: paymentData.type, // Adicionando o tipo
      };
      console.log("Payload completo:", payload);

      const apiUrl = "/api/registration/process";
      console.log("Enviando requisição para:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Status da resposta:", response.status);

      const responseText = await response.text();
      console.log("Resposta bruta:", responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("Resposta do processo:", responseData);
      } catch (parseError) {
        console.error("Erro ao fazer parse da resposta:", parseError);
        throw new Error("Resposta inválida do servidor");
      }

      console.log("Dados da resposta:", responseData);

      if (!response.ok) {
        throw new Error(
          responseData.error ||
            responseData.message ||
            "Erro ao processar registro"
        );
      }

      // Atualiza a URL de sucesso para incluir informações adicionais
      const successUrl = new URL("/registro-sucesso", window.location.origin);
      if (responseData.isNewUser) {
        successUrl.searchParams.set("new", "true");
        successUrl.searchParams.set("password", responseData.initialPassword);
      }

      toast({
        title: "Registro realizado com sucesso!",
        description: responseData.isNewUser
          ? `Sua senha inicial é: ${responseData.initialPassword}`
          : "Nova avaliação cadastrada.",
      });

      router.push(successUrl.toString());
    } catch (error) {
      console.error("Erro detalhado:", error);
      toast({
        title: "Erro no registro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível completar seu registro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-zinc-900 border-zinc-800">
      <CardContent className="p-4 sm:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col space-y-4">
              {/* Seção de Informações Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informações Pessoais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-sm font-medium">
                          Nome Completo
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full p-2 bg-zinc-800 border-zinc-700 rounded-md"
                            disabled={isExistingUser}
                            readOnly={isExistingUser}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-sm font-medium">
                          E-mail
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full p-2 bg-zinc-800 border-zinc-700 rounded-md"
                            disabled={isExistingUser}
                            readOnly={isExistingUser}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-zinc-400">
                          E-mail utilizado para liberar a plataforma Nelogica.
                        </FormDescription>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          CPF
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full p-2 bg-zinc-800 border-zinc-700 rounded-md"
                            disabled={isExistingUser}
                            readOnly={isExistingUser}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Telefone
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full p-2 bg-zinc-800 border-zinc-700 rounded-md"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Seção de Datas */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Datas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Data de Nascimento
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="w-full p-2 bg-zinc-800 border-zinc-700 rounded-md"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Data de Início
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="w-full p-2 bg-zinc-800 border-zinc-700 rounded-md"
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-zinc-400">
                          Data utilizada para liberar e iniciar sua avaliação.
                        </FormDescription>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Seção de Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Endereço</h3>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Endereço Completo
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full p-2 bg-zinc-800 border-zinc-700 rounded-md"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className="max-w-xs">
                      <FormLabel className="text-sm font-medium">CEP</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full p-2 bg-zinc-800 border-zinc-700 rounded-md"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Seção de Configurações */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configurações</h3>
                <FormField
                  control={form.control}
                  name="consistencyLock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Trava de Consistência Diária
                      </FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        defaultValue={field.value ? "true" : "false"}
                      >
                        <SelectTrigger className="w-full p-2 bg-zinc-800 border-zinc-700 rounded-md">
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Sim</SelectItem>
                          <SelectItem value="false">Não</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs text-zinc-400">
                        Define se você deseja utilizar a trava de consistência
                        diária
                      </FormDescription>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Finalizar Registro"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
