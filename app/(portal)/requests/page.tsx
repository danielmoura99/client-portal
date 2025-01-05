// app/(portal)/requests/page.tsx
import { RequestList } from "./_components/request-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function RequestsPage() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Solicitações</h1>
          <p className="text-zinc-400">
            Gerencie suas solicitações e acompanhe o status
          </p>
        </div>

        <Button asChild>
          <Link href="/requests/new">
            <Plus className="w-4 h-4 mr-2" />
            Nova Solicitação
          </Link>
        </Button>
      </div>

      <RequestList />
    </div>
  );
}
