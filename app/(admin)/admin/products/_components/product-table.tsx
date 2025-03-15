/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(admin)/admin/products/_components/product-table.tsx
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
  Book,
  FileSpreadsheet,
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
import { ProductType } from "@prisma/client";
//import { DeleteProductDialog } from "./delete-product-dialog";
import { CustomDeleteProductModal } from "./custom-delete-product-modal";

interface ProductTableProps {
  initialProducts: any[];
}

export default function ProductTable({ initialProducts }: ProductTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState(initialProducts);

  // Estado para controlar o diálogo de exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [tableKey, setTableKey] = useState(0);

  // Filtrar produtos com base na pesquisa
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.slug.includes(searchQuery)
  );

  // Helper para exibir o tipo de produto
  const getProductTypeBadge = (type: ProductType) => {
    switch (type) {
      case "COURSE":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
          >
            <Book className="h-3 w-3 mr-1" />
            Curso
          </Badge>
        );
      case "TOOL":
        return (
          <Badge
            variant="secondary"
            className="bg-green-500/20 text-green-500 hover:bg-green-500/30"
          >
            <FileSpreadsheet className="h-3 w-3 mr-1" />
            Ferramenta
          </Badge>
        );
      case "EVALUATION":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
          >
            <FileText className="h-3 w-3 mr-1" />
            Avaliação
          </Badge>
        );
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const handleDeleteClick = (product: any) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4" key={tableKey}>
      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar produtos..."
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
              <TableHead className="text-zinc-400">ID</TableHead>{" "}
              {/* Nova coluna */}
              <TableHead className="text-zinc-400">Nome</TableHead>
              <TableHead className="text-zinc-400">Slug</TableHead>
              <TableHead className="text-zinc-400">Tipo</TableHead>
              <TableHead className="text-zinc-400">Conteúdos</TableHead>
              <TableHead className="text-zinc-400">Usuários</TableHead>
              <TableHead className="text-right text-zinc-400">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-zinc-500"
                >
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow
                  key={product.id}
                  className="border-zinc-800 hover:bg-zinc-900/50"
                >
                  <TableCell className="font-medium text-zinc-200">
                    {product.courseId}
                  </TableCell>
                  <TableCell className="font-medium text-zinc-200">
                    {product.name}
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {product.slug}
                  </TableCell>
                  <TableCell>{getProductTypeBadge(product.type)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-zinc-800 hover:bg-zinc-800"
                    >
                      {product._count.contents}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-zinc-800 hover:bg-zinc-800"
                    >
                      {product._count.userProducts}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
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
                          <Link href={`/admin/products/${product.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Produto
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${product.id}/contents`}>
                            <FileText className="h-4 w-4 mr-2" />
                            Gerenciar Conteúdos
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir Produto
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo de exclusão */}
      {productToDelete && (
        <CustomDeleteProductModal
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          product={productToDelete}
          onDeleted={() => {
            // Use a função updater do setState para garantir que está atualizando
            // com base no estado mais recente
            setProducts((prevProducts) =>
              prevProducts.filter((p) => p.id !== productToDelete.id)
            );
            // Forçar re-renderização se necessário
            setTableKey((prevKey) => prevKey + 1);
          }}
        />
      )}
    </div>
  );
}
