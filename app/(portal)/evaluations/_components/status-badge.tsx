// app/(portal)/evaluations/_components/status-badge.tsx
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

const statusConfig = {
  "Aguardando Inicio": {
    color: "text-yellow-500 border-yellow-500",
    label: "Aguardando Início",
  },
  "Em Curso": {
    color: "text-blue-500 border-blue-500",
    label: "Em Avaliação",
  },
  Aprovado: {
    color: "text-green-500 border-green-500",
    label: "Aprovado",
  },
  Reprovado: {
    color: "text-red-500 border-red-500",
    label: "Reprovado",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    color: "text-zinc-500 border-zinc-500",
    label: status,
  };

  return (
    <Badge variant="outline" className={`${config.color} bg-transparent`}>
      {config.label}
    </Badge>
  );
}
