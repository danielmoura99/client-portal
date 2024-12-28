// client-portal/app/pagamento-invalido/page.tsx
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function InvalidPaymentPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-zinc-100 mb-2">
            Pagamento Inválido ou Expirado
          </h1>
          <p className="text-zinc-400">
            O link que você acessou não é mais válido ou já foi processado. Por
            favor, entre em contato com nosso suporte para assistência.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
