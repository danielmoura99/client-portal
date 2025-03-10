// app/(admin)/admin/users/[userId]/access/_components/user-access-manager.tsx
"use client";

import { useState } from "react";
import { ProductType } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  MinusCircle,
  PlusCircle,
  Book,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addProductAccess, removeProductAccess } from "../_actions/index";

interface UserAccessManagerProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  assignedProducts: {
    id: string;
    name: string;
    description: string;
    type: ProductType;
    slug: string;
  }[];
  unassignedProducts: {
    id: string;
    name: string;
    description: string;
    type: ProductType;
    slug: string;
  }[];
}

export function UserAccessManager({
  user,
  assignedProducts: initialAssignedProducts,
  unassignedProducts: initialUnassignedProducts,
}: UserAccessManagerProps) {
  const [assignedProducts, setAssignedProducts] = useState(
    initialAssignedProducts
  );
  const [unassignedProducts, setUnassignedProducts] = useState(
    initialUnassignedProducts
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>("");
  const [selectedProductToRemove, setSelectedProductToRemove] =
    useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper para os ícones dos tipos de produto
  const getProductTypeIcon = (type: ProductType) => {
    switch (type) {
      case "COURSE":
        return <Book className="h-4 w-4 text-blue-500" />;
      case "TOOL":
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-zinc-500" />;
    }
  };

  // Função para adicionar acesso
  const handleAddAccess = async () => {
    if (!selectedProductToAdd) return;

    setIsSubmitting(true);

    try {
      // Chamar server action para adicionar acesso
      await addProductAccess(user.id, selectedProductToAdd);

      // Encontrar o produto selecionado
      const productToAdd = unassignedProducts.find(
        (p) => p.id === selectedProductToAdd
      );

      if (productToAdd) {
        // Atualizar os estados
        setAssignedProducts([...assignedProducts, productToAdd]);
        setUnassignedProducts(
          unassignedProducts.filter((p) => p.id !== selectedProductToAdd)
        );
      }

      toast({
        title: "Acesso concedido",
        description: `O usuário agora tem acesso a ${productToAdd?.name}`,
      });

      // Fechar o diálogo
      setIsAddDialogOpen(false);
      setSelectedProductToAdd("");
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o acesso",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para remover acesso
  const handleRemoveAccess = async () => {
    if (!selectedProductToRemove) return;

    setIsSubmitting(true);

    try {
      // Chamar server action para remover acesso
      await removeProductAccess(user.id, selectedProductToRemove);

      // Encontrar o produto selecionado
      const productToRemove = assignedProducts.find(
        (p) => p.id === selectedProductToRemove
      );

      if (productToRemove) {
        // Atualizar os estados
        setUnassignedProducts([...unassignedProducts, productToRemove]);
        setAssignedProducts(
          assignedProducts.filter((p) => p.id !== selectedProductToRemove)
        );
      }

      toast({
        title: "Acesso removido",
        description: `O acesso a ${productToRemove?.name} foi removido`,
      });

      // Fechar o diálogo
      setIsRemoveDialogOpen(false);
      setSelectedProductToRemove("");
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o acesso",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Produtos Atribuídos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Produtos Concedidos</CardTitle>
              <CardDescription>
                Produtos aos quais o usuário tem acesso
              </CardDescription>
            </div>

            <Dialog
              open={isRemoveDialogOpen}
              onOpenChange={setIsRemoveDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={assignedProducts.length === 0}
                >
                  <MinusCircle className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remover Acesso</DialogTitle>
                  <DialogDescription>
                    Selecione o produto que deseja remover do usuário{" "}
                    {user.name}.
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <Select
                    value={selectedProductToRemove}
                    onValueChange={setSelectedProductToRemove}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignedProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center">
                            {getProductTypeIcon(product.type)}
                            <span className="ml-2">{product.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsRemoveDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleRemoveAccess}
                    disabled={!selectedProductToRemove || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Removendo...
                      </>
                    ) : (
                      <>
                        <MinusCircle className="mr-2 h-4 w-4" />
                        Remover Acesso
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {assignedProducts.length === 0 ? (
            <div className="text-center p-6 border border-dashed border-zinc-800 rounded-lg">
              <p className="text-zinc-500">
                Este usuário não tem acesso a nenhum produto
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {assignedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-start p-3 rounded-lg bg-zinc-900/50 border border-zinc-800"
                >
                  <div className="mr-3 pt-0.5">
                    {getProductTypeIcon(product.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-100">
                      {product.name}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {product.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Produtos Disponíveis */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Produtos Disponíveis</CardTitle>
              <CardDescription>
                Produtos que podem ser adicionados
              </CardDescription>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  disabled={unassignedProducts.length === 0}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Acesso</DialogTitle>
                  <DialogDescription>
                    Selecione o produto que deseja conceder ao usuário{" "}
                    {user.name}.
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <Select
                    value={selectedProductToAdd}
                    onValueChange={setSelectedProductToAdd}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center">
                            {getProductTypeIcon(product.type)}
                            <span className="ml-2">{product.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddAccess}
                    disabled={!selectedProductToAdd || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Acesso
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {unassignedProducts.length === 0 ? (
            <div className="text-center p-6 border border-dashed border-zinc-800 rounded-lg">
              <p className="text-zinc-500">
                Não há produtos disponíveis para adicionar
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {unassignedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-start p-3 rounded-lg bg-zinc-900/50 border border-zinc-800"
                >
                  <div className="mr-3 pt-0.5">
                    {getProductTypeIcon(product.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-100">
                      {product.name}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {product.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
