/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(portal)/requests/_components/request-list.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getRequests } from "../_actions";
import { RequestDetails } from "./request-details";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, Search } from "lucide-react";
import { RequestStatus } from "@/types";

const requestTypeMap = {
  EVALUATION_APPROVAL: "Aprovação de Avaliação",
  START_DATE_CHANGE: "Mudança de Data",
  WITHDRAWAL: "Saque de Recursos",
  PLATFORM_ISSUE: "Problema na Plataforma",
  GENERAL: "Outras Solicitações",
};

const statusOptions = [
  { value: "ALL", label: "Todos os Status" },
  { value: "PENDING", label: "Pendente" },
  { value: "IN_ANALYSIS", label: "Em Análise" },
  { value: "COMPLETED", label: "Concluído" },
] as const;

type FilterStatus = RequestStatus | "ALL";

export function RequestList() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("ALL");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const isAdmin = session?.user?.role === "ADMIN";

  async function loadRequests() {
    try {
      const data = await getRequests(
        selectedStatus === "ALL" ? undefined : (selectedStatus as RequestStatus)
      );
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filtragem local dos resultados
  const filteredRequests = requests.filter((request) => {
    // Verifica se o usuário tem permissão para ver a solicitação
    if (!isAdmin && request.userId !== session?.user?.id) {
      return false;
    }
    const matchesSearch = searchQuery
      ? request.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        requestTypeMap[request.type as keyof typeof requestTypeMap]
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      : true;

    const requestDate = new Date(request.createdAt);
    const matchesStartDate = startDate
      ? requestDate >= new Date(startDate)
      : true;
    const matchesEndDate = endDate ? requestDate <= new Date(endDate) : true;

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 min-w-[280px]">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-36"
          />
          <span className="text-zinc-400">-</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-36"
          />
        </div>

        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Pesquisar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

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

      <div className="rounded-md border border-zinc-800">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b bg-zinc-800 border-zinc-800">
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-400">
                  Data
                </th>
                {isAdmin && (
                  <th className="h-12 px-4 text-left align-middle font-medium text-zinc-400">
                    Cliente
                  </th>
                )}
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-400">
                  Assunto
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-zinc-400">
                  Status
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-zinc-400">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-zinc-800 transition-colors hover:bg-zinc-800/50"
                >
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-zinc-400" />
                      <span>{formatDate(request.createdAt)}</span>
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="p-4 align-middle">
                      {request.user?.name || "Cliente não encontrado"}
                    </td>
                  )}
                  <td className="p-4 align-middle">
                    {
                      requestTypeMap[
                        request.type as keyof typeof requestTypeMap
                      ]
                    }
                  </td>
                  <td className="p-4 align-middle">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${request.status === "PENDING" ? "bg-yellow-500/10 text-yellow-500" : ""}
                        ${request.status === "IN_ANALYSIS" ? "bg-blue-500/10 text-blue-500" : ""}
                        ${request.status === "COMPLETED" ? "bg-green-500/10 text-green-500" : ""}
                      `}
                    >
                      {request.status === "PENDING" && "Pendente"}
                      {request.status === "IN_ANALYSIS" && "Em Análise"}
                      {request.status === "COMPLETED" && "Concluído"}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-6 text-sm text-zinc-400">
            {isAdmin
              ? "Nenhuma solicitação encontrada no sistema"
              : "Você não possui nenhuma solicitação"}
          </div>
        )}
      </div>

      <RequestDetails
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onUpdate={loadRequests}
      />
    </div>
  );
}
