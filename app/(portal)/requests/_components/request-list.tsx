// app/(portal)/requests/_components/request-list.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getRequests } from "../_actions";
import { RequestItem } from "./request-item";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequestStatus } from "@/types";

const statusOptions = [
  { value: "ALL", label: "Todos os Status" },
  { value: "PENDING", label: "Pendente" },
  { value: "IN_ANALYSIS", label: "Em Análise" },
  { value: "COMPLETED", label: "Concluído" },
] as const;

type FilterStatus = RequestStatus | "ALL";

export function RequestList() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("ALL");

  const isAdmin = session?.user?.role === "ADMIN";

  async function loadRequests() {
    try {
      const data = await getRequests(
        selectedStatus === "ALL" ? undefined : (selectedStatus as RequestStatus)
      );
      console.log("Dados recebidos:", data);
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, [selectedStatus]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">
            {isAdmin ? "Todas as Solicitações" : "Minhas Solicitações"}
          </h2>
          <p className="text-sm text-zinc-400">
            {requests.length} solicitação(ões) encontrada(s)
          </p>
        </div>

        <div className="flex gap-4">
          <Select
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value as FilterStatus)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-zinc-400">Nenhuma solicitação encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <RequestItem
              key={request.id}
              request={request}
              onUpdate={loadRequests} // Passando a função de atualização
            />
          ))}
        </div>
      )}
    </div>
  );
}
