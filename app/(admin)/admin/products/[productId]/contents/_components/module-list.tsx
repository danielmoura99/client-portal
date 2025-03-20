// app/(admin)/admin/products/[productId]/contents/_components/module-list.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Plus, Trash2, Lock, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { DeleteModuleDialog } from "../modules/_components/delete-module-dialog";
import { Badge } from "@/components/ui/badge";

interface Module {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  immediateAccess: boolean;
  releaseAfterDays: number | null;
  _count?: {
    contents: number;
  };
}

interface ModuleListProps {
  modules: Module[];
  productId: string;
}

export default function ModuleList({ modules, productId }: ModuleListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);
  const router = useRouter();

  const handleDeleteClick = (module: Module) => {
    setModuleToDelete(module);
    setDeleteDialogOpen(true);
  };

  const handleModuleDeleted = () => {
    router.refresh();
  };

  // Ordenar módulos por sortOrder
  const sortedModules = [...modules].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-zinc-100">Módulos</h2>

        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/products/${productId}/contents/modules/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Módulo
          </Link>
        </Button>
      </div>

      {modules.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-zinc-800 rounded-lg">
          <p className="text-zinc-400">
            Nenhum módulo cadastrado para este produto.
          </p>
          <Button asChild className="mt-4">
            <Link href={`/admin/products/${productId}/contents/modules/new`}>
              Adicionar Primeiro Módulo
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedModules.map((module) => (
            <div
              key={module.id}
              className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-zinc-200 text-base">
                      {module.title}
                    </h3>

                    {(module._count?.contents || 0) > 0 && (
                      <Badge className="bg-blue-500/20 text-blue-400">
                        {module._count?.contents} conteúdo(s)
                      </Badge>
                    )}

                    {/* Badge de acesso imediato ou programado */}
                    {module.immediateAccess ? (
                      <Badge className="bg-green-500/20 text-green-400 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Acesso Imediato
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/20 text-amber-400 flex items-center">
                        <Lock className="h-3 w-3 mr-1" />
                        {module.releaseAfterDays
                          ? `Liberado após ${module.releaseAfterDays} dias`
                          : "Bloqueado"}
                      </Badge>
                    )}
                  </div>

                  {module.description && (
                    <p className="text-sm text-zinc-400 mt-1.5">
                      {module.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-zinc-500 bg-zinc-800/70 px-2 py-0.5 rounded">
                      Ordem: {module.sortOrder}
                    </span>

                    <span className="text-xs text-zinc-500">
                      ID: {module.id.substring(0, 8)}...
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" asChild className="h-8">
                    <Link
                      href={`/admin/products/${productId}/contents/modules/${module.id}`}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-red-800/30 text-red-500 hover:text-red-400 hover:bg-red-950/20 hover:border-red-800/40"
                    onClick={() => handleDeleteClick(module)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {moduleToDelete && (
        <DeleteModuleDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          module={{
            id: moduleToDelete.id,
            title: moduleToDelete.title,
            hasContents: (moduleToDelete._count?.contents || 0) > 0,
          }}
          productId={productId}
          onDeleted={handleModuleDeleted}
        />
      )}
    </div>
  );
}
