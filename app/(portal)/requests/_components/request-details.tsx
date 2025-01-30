/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { RequestStatus } from "@/types";

const requestTypeMap = {
  EVALUATION_APPROVAL: "Aprovação de Avaliação",
  START_DATE_CHANGE: "Mudança de Data",
  WITHDRAWAL: "Saque de Recursos",
  PLATFORM_ISSUE: "Problema na Plataforma",
  GENERAL: "Outras Solicitações",
};

const statusMap = {
  PENDING: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-500" },
  IN_ANALYSIS: { label: "Em Análise", color: "bg-blue-500/10 text-blue-500" },
  COMPLETED: { label: "Concluído", color: "bg-green-500/10 text-green-500" },
};

interface RequestDetailsProps {
  request: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => Promise<void>;
}

export function RequestDetails({
  request,
  isOpen,
  onClose,
  onUpdate,
}: RequestDetailsProps) {
  const { data: session } = useSession();
  const [newResponse, setNewResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";
  const isCompleted = request?.status === "COMPLETED";
  const isOwner = session?.user?.id === request?.userId;

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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <SheetTitle>
            <div className="flex items-center gap-3">
              <span>
                {requestTypeMap[request?.type as keyof typeof requestTypeMap]}
              </span>
              <Badge
                variant="secondary"
                className={
                  request?.status
                    ? statusMap[request.status as keyof typeof statusMap].color
                    : ""
                }
              >
                {request?.status
                  ? statusMap[request.status as keyof typeof statusMap].label
                  : ""}
              </Badge>
            </div>
          </SheetTitle>

          {request?.user && (
            <p className="text-sm text-zinc-400">
              por {request.user.name} ({request.user.email})
            </p>
          )}
          <p className="text-xs text-zinc-400">
            {new Date(request?.createdAt).toLocaleString("pt-BR")}
          </p>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {isAdmin && (
            <div className="flex items-center gap-4">
              <Select
                value={request?.status}
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

          <div className="bg-zinc-800/50 p-4 rounded-lg">
            <p className="text-zinc-200">{request?.description}</p>
          </div>

          {request?.responses?.length > 0 && (
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
