/* eslint-disable @typescript-eslint/no-explicit-any */
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
  ExternalLink,
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
import { DeleteContentDialog } from "@/app/(admin)/admin/contents/_components/delete-content-dialog";

interface ProductContentsTableProps {
  initialContents: any[]; // ProductContent[]
  productId: string;
}

export default function ProductContentsTable({
  initialContents,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  productId,
}: ProductContentsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [productContents, setProductContents] = useState(initialContents);

  // Estado para controlar o diálogo de exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<any>(null);

  // Filtrar conteúdos com base na pesquisa
  const filteredContents = productContents.filter((productContent) => {
    // Usando a estrutura content dentro de productContent
    const content = productContent.content;
    return (
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.module?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Helper para ícones de tipo de conteúdo
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

  // Helper para obter o nome do tipo
  const getContentTypeName = (type: string) => {
    switch (type) {
      case "video":
        return "Vídeo";
      case "file":
        return "Arquivo";
      case "article":
        return "Artigo";
      default:
        return type;
    }
  };

  const handleDeleteClick = (productContent: any) => {
    // Certifique-se de que o productContentId está sendo passado
    setContentToDelete({
      id: productContent.content.id,
      title: productContent.content.title,
      type: productContent.content.type,
      productContentId: productContent.id, // ID da tabela intermediária
    });
    setDeleteDialogOpen(true);
  };

  const handleDownload = (contentId: string) => {
    window.open(`/api/contents/${contentId}`, "_blank");
  };

  const handleContentDeleted = (productContentId: string) => {
    setProductContents(
      productContents.filter((pc) => pc.id !== productContentId)
    );
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
              <TableHead className="text-zinc-400">Módulo</TableHead>
              <TableHead className="text-zinc-400">Ordem</TableHead>
              <TableHead className="text-zinc-400">Caminho</TableHead>
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
              filteredContents.map((productContent) => {
                // Extraindo o objeto content de productContent
                const content = productContent.content;
                return (
                  <TableRow
                    key={productContent.id}
                    className="border-zinc-800 hover:bg-zinc-900/50"
                  >
                    <TableCell className="font-medium text-zinc-200">
                      <div className="flex items-center gap-2">
                        {getContentTypeIcon(content.type, content.path)}
                        <span>{content.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-zinc-800/50">
                        {getContentTypeName(content.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {content.module ? content.module.title : "—"}
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {productContent.sortOrder}
                    </TableCell>
                    <TableCell className="text-zinc-400 truncate max-w-[200px]">
                      <div className="flex items-center gap-1">
                        {content.path.startsWith("http") ? (
                          <ExternalLink className="h-3 w-3 text-blue-500" />
                        ) : (
                          <File className="h-3 w-3 text-zinc-500" />
                        )}
                        <span className="truncate">{content.path}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1">
                        {content.type === "file" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(content.id)}
                            title="Baixar arquivo"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}

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
                              <Link href={`/admin/contents/edit/${content.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar Conteúdo
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-500 focus:text-red-500"
                              onClick={() => handleDeleteClick(productContent)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir Conteúdo
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
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
          onDeleted={handleContentDeleted}
        />
      )}
    </div>
  );
}
