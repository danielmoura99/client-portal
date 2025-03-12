/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(admin)/admin/contents/_components/content-table.tsx
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  Search,
  Edit,
  Trash2,
  FileText,
  Video,
  File,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { DeleteContentDialog } from "./delete-content-dialog";

interface ContentTableProps {
  initialContents: any[];
}

export default function ContentTable({ initialContents }: ContentTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [contents, setContents] = useState(initialContents);

  // Estado para controlar o diálogo de exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<any>(null);

  // Filtrar conteúdos com base na pesquisa
  const filteredContents = contents.filter(
    (content) =>
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper para ícones de tipo de conteúdo
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getContentTypeIcon = (type: string, path?: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "file":
        if (path?.endsWith(".pdf")) {
          return <FileText className="h-4 w-4 text-red-500" />;
        } else if (path?.endsWith(".xlsx") || path?.endsWith(".xls")) {
          return <FileText className="h-4 w-4 text-green-500" />;
        } else {
          return <File className="h-4 w-4 text-zinc-500" />;
        }
      default:
        return <File className="h-4 w-4 text-zinc-500" />;
    }
  };

  // Função para fazer download direto (opcional)
  const handleDownload = async (contentId: string) => {
    try {
      window.open(`/api/contents/${contentId}`, "_blank");
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
    }
  };

  const handleDeleteClick = (content: any) => {
    setContentToDelete(content);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar conteúdos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-800/50 hover:bg-zinc-800">
              <TableHead className="text-zinc-400">Título</TableHead>
              <TableHead className="text-zinc-400">Tipo</TableHead>
              <TableHead className="text-zinc-400">Produto</TableHead>
              <TableHead className="text-zinc-400">Caminho</TableHead>
              <TableHead className="text-zinc-400">Data</TableHead>
              <TableHead className="text-right text-zinc-400">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-zinc-500"
                >
                  Nenhum conteúdo encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredContents.map((content) => (
                <TableRow
                  key={content.id}
                  className="border-zinc-800 hover:bg-zinc-900/50"
                >
                  <TableCell className="font-medium text-zinc-200">
                    {content.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-zinc-800/50">
                      {content.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {content.product
                      ? content.product.name
                      : content.productContents &&
                          content.productContents.length > 0
                        ? content.productContents[0].product.name
                        : "-"}
                  </TableCell>
                  <TableCell className="text-zinc-400 truncate max-w-[200px]">
                    {content.path}
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {new Date(content.createdAt).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(content.id)}
                        title="Baixar arquivo"
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/contents/${content.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500"
                            onClick={() => handleDeleteClick(content)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo de exclusão */}
      {contentToDelete && (
        <DeleteContentDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          content={contentToDelete}
          productId={
            contentToDelete.productId ||
            (contentToDelete.productContents &&
            contentToDelete.productContents.length > 0
              ? contentToDelete.productContents[0].productId
              : undefined)
          }
          onDeleted={(contentId) => {
            setContents(contents.filter((c) => c.id !== contentId));
          }}
        />
      )}
    </div>
  );
}
