// hooks/use-requests.ts
import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface Request {
  id: string;
  type: string;
  status: string;
  description: string;
  responses: Array<{
    id: string;
    message: string;
    isFromAdmin: boolean;
    createdAt: string;
  }>;
  user?: {
    name: string;
    email: string;
  };
}

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetch("/api/requests");
      if (!response.ok) throw new Error();
      const data = await response.json();
      setRequests(data);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as solicitações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const addResponse = useCallback(
    async (requestId: string, message: string) => {
      try {
        const response = await fetch(`/api/requests/${requestId}/responses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });

        if (!response.ok) throw new Error();

        // Atualiza a lista local
        await fetchRequests();

        toast({
          title: "Sucesso",
          description: "Resposta adicionada com sucesso.",
        });
      } catch {
        toast({
          title: "Erro",
          description: "Não foi possível adicionar a resposta.",
          variant: "destructive",
        });
      }
    },
    [fetchRequests]
  );

  const updateStatus = useCallback(
    async (requestId: string, status: string) => {
      try {
        const response = await fetch(`/api/requests/${requestId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) throw new Error();

        // Atualiza a lista local
        await fetchRequests();

        toast({
          title: "Sucesso",
          description: "Status atualizado com sucesso.",
        });
      } catch {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status.",
          variant: "destructive",
        });
      }
    },
    [fetchRequests]
  );

  return {
    requests,
    loading,
    fetchRequests,
    addResponse,
    updateStatus,
  };
}
