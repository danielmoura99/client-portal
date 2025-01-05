/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(portal)/requests/_components/request-item.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { addResponse, updateRequestStatus } from "../_actions";
import { toast } from "@/hooks/use-toast";
import { RequestStatus } from "@prisma/client";

const requestTypeMap = {
  EVALUATION_APPROVAL: "Aprovação de Avaliação",
  START_DATE_CHANGE: "Mudança de Data",
  WITHDRAWAL: "Saque de Recursos",
  PLATFORM_ISSUE: "Problema na Plataforma",
  GENERAL: "Outras Solicitações",
};

const statusMap = {
  PENDING: { label: "Pendente", color: "bg-yellow-500" },
  IN_ANALYSIS: { label: "Em Análise", color: "bg-blue-500" },
  COMPLETED: { label: "Concluído", color: "bg-green-500" },
};

interface RequestItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: any;
  onUpdate: () => Promise<void>;
}

export function RequestItem({ request, onUpdate }: RequestItemProps) {
  const { data: session } = useSession();
  const [newResponse, setNewResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const isAdmin = session?.user?.role === "ADMIN";
  const isCompleted = request.status === "COMPLETED";
  const isOwner = session?.user?.id === request.userId;

  async function handleAddResponse() {
    if (!newResponse.trim()) return;

    setSubmitting(true);
    try {
      await addResponse(request.id, newResponse);
      setNewResponse("");
      setShowResponseForm(false);
      toast({
        title: "Resposta adicionada",
        description: "Sua resposta foi adicionada com sucesso.",
      });
      await onUpdate();
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar sua resposta.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(status: RequestStatus) {
    try {
      await updateRequestStatus(request.id, status);
      toast({
        title: "Status atualizado",
        description: "O status da solicitação foi atualizado com sucesso.",
      });
      await onUpdate();
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">
                {requestTypeMap[request.type as keyof typeof requestTypeMap]}
              </h3>
              <Badge
                variant="secondary"
                className={
                  statusMap[request.status as keyof typeof statusMap].color
                }
              >
                {statusMap[request.status as keyof typeof statusMap].label}
              </Badge>
            </div>
            {request.user && (
              <p className="text-sm text-zinc-400">
                por {request.user.name} ({request.user.email})
              </p>
            )}
            <p className="text-xs text-zinc-400 mt-1">
              {new Date(request.createdAt).toLocaleString("pt-BR")}
            </p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-4">
              <Select
                value={request.status}
                onValueChange={(value) =>
                  handleStatusChange(value as RequestStatus)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="IN_ANALYSIS">Em Análise</SelectItem>
                  <SelectItem value="COMPLETED">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-zinc-800/50 p-4 rounded-lg">
          <p className="text-zinc-200">{request.description}</p>
        </div>

        {request.responses.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Respostas:</h4>
            {request.responses.map((response: any) => (
              <div
                key={response.id}
                className={`p-4 rounded-lg ${
                  response.isFromAdmin ? "bg-blue-500/10" : "bg-zinc-800/50"
                }`}
              >
                <p className="text-sm text-zinc-300">{response.message}</p>
                <p className="text-xs text-zinc-400 mt-2">
                  {new Date(response.createdAt).toLocaleString("pt-BR")}
                  {response.isFromAdmin && " - Equipe de Suporte"}
                </p>
              </div>
            ))}
          </div>
        )}

        {!isCompleted && (isAdmin || isOwner) && !showResponseForm && (
          <Button
            variant="outline"
            onClick={() => setShowResponseForm(true)}
            className="w-full"
          >
            {isAdmin ? "Responder Solicitação" : "Adicionar Resposta"}
          </Button>
        )}

        {!isCompleted && showResponseForm && (
          <div className="space-y-4">
            <Textarea
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
              placeholder={
                isAdmin ? "Digite sua resposta..." : "Digite sua mensagem..."
              }
              className="min-h-[100px]"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowResponseForm(false);
                  setNewResponse("");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddResponse}
                disabled={!newResponse.trim() || submitting}
              >
                Enviar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
