/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PagarmePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: string;
  evaluationId: string;
  renewalType: "evaluation" | "paid_account";
}

export function PagarmePaymentModal({
  isOpen,
  onClose,
  platform,
  evaluationId,
  renewalType,
}: PagarmePaymentModalProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pixData, setPixData] = useState<{
    pixCode: string;
    pixQrCode: string;
    amount: number;
  } | null>(null);

  // Determinar o valor baseado na plataforma (para exibição inicial)
  const getAmount = (platform: string): number => {
    if (platform === "Profit One") return 98.50;
    if (platform === "Profit Pro") return 226.00;
    if (platform === "Profit Teste") return 10.00;
    return 0;
  };

  const handleGeneratePix = async () => {
    setIsGenerating(true);

    try {
      // Chamar API do trader-evaluation para gerar PIX via PAGARME
      const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL;
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

      console.log("[Pagarme Modal] ADMIN_API_URL:", ADMIN_API_URL);
      console.log(
        "[Pagarme Modal] API_KEY:",
        API_KEY ? "***" + API_KEY.slice(-4) : "undefined"
      );
      console.log("[Pagarme Modal] Evaluation ID:", evaluationId);
      console.log("[Pagarme Modal] Renewal Type:", renewalType);

      if (!ADMIN_API_URL) {
        throw new Error("NEXT_PUBLIC_ADMIN_API_URL não configurada");
      }

      // URL específica para Pagarme Platform Renewal
      const url = `${ADMIN_API_URL}/api/client-portal/pagarme/generate-platform-pix`;
      console.log("[Pagarme Modal] Calling URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          evaluationId,
          renewalType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("[Pagarme Modal] API Error Response:", error);
        throw new Error(error.error || error.message || "Erro ao gerar PIX");
      }

      const data = await response.json();

      console.log("[Pagarme Modal] PIX gerado com sucesso:", {
        orderId: data.renewal.orderId,
        amount: data.renewal.amount,
      });

      setPixData({
        pixCode: data.renewal.pixCode,
        pixQrCode:
          data.renewal.pixQrCode ||
          "https://via.placeholder.com/300x300?text=QR+Code",
        amount: data.renewal.amount,
      });

      toast({
        title: "Sucesso!",
        description: "PIX Pagarme gerado com sucesso!",
      });
    } catch (error: any) {
      console.error("[Pagarme Modal] Erro ao gerar PIX:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar PIX. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPixCode = () => {
    if (pixData?.pixCode) {
      navigator.clipboard.writeText(pixData.pixCode);
      toast({
        title: "Copiado!",
        description: "Código PIX copiado para a área de transferência",
      });
    }
  };

  const formatCurrency = (value: number) => {
    // Verificar se é valor em centavos ou reais
    // Se for >= 100, assumimos que é centavos (API response)
    // Se for < 100, assumimos que é reais (getAmount local)
    const valueInReais = value >= 100 ? value / 100 : value;

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valueInReais);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Renovação de Plataforma</DialogTitle>
          <DialogDescription>
            Renove sua plataforma {platform} por mais 30 dias via Pagarme
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!pixData ? (
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-zinc-400 mb-2">
                  Valor da renovação mensal:
                </p>
                <p className="text-3xl font-bold text-green-500">
                  {formatCurrency(getAmount(platform))}
                </p>
              </div>

              <Button
                onClick={handleGeneratePix}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando PIX Pagarme...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    Gerar PIX
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-zinc-400 mb-2">Valor:</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatCurrency(pixData.amount)}
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center bg-white p-4 rounded-lg">
                <img
                  src={pixData.pixQrCode}
                  alt="QR Code PIX"
                  className="w-64 h-64"
                />
              </div>

              {/* Código PIX Copia e Cola */}
              <div className="space-y-2">
                <p className="text-sm font-medium">PIX Copia e Cola:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={pixData.pixCode}
                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm font-mono truncate"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyPixCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-400">
                <p className="font-medium mb-1">⏱️ Instruções:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Este PIX expira em 1 hora</li>
                  <li>
                    Após o pagamento, aguarde até 5 minutos para confirmação
                  </li>
                  <li>
                    Sua plataforma será renovada automaticamente após a
                    confirmação
                  </li>
                  <li className="text-green-400">
                    ✅ Processamento via Pagarme
                  </li>
                </ul>
              </div>

              <Button onClick={onClose} variant="outline" className="w-full">
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
