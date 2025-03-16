// client-portal/app/registration/[paymentId]/page.tsx
import { redirect } from "next/navigation";
import { RegistrationForm } from "./_components/registration-form";

interface PageProps {
  params: Promise<{ paymentId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function validatePayment(paymentId: string) {
  try {
    // Tentar B3 primeiro
    let response = await fetch(
      `${process.env.NEXT_PUBLIC_ADMIN_API_URL}/api/registration/validate-payment?paymentId=${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.valid && data.paymentData?.status !== "completed") {
        console.log("Validação B3 bem sucedida");
        return {
          ...data,
          paymentData: {
            ...data.paymentData,
            hublaPaymentId: paymentId,
          },
          type: "B3",
        };
      }
    }

    // Tentar FX
    response = await fetch(
      `${process.env.NEXT_PUBLIC_ADMIN_API_URL_FX}/api/registration/validate-payment?paymentId=${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.valid && data.paymentData?.status !== "completed") {
        console.log("Validação FX bem sucedida");
        return {
          ...data,
          paymentData: {
            ...data.paymentData,
            hublaPaymentId: paymentId,
          },
          type: "FX",
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Erro ao validar pagamento:", error);
    return null;
  }
}

export default async function RegistrationPage({
  params,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const validationResult = await validatePayment(resolvedParams.paymentId);

  if (!validationResult || !validationResult.paymentData?.id) {
    redirect("/pagamento-invalido");
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-zinc-100">
            Registro de Avaliação
          </h1>
          <p className="text-zinc-400">
            Completando esse cadastro iniciaremos sua avaliação na data de
            início escolhida e liberamos seu acesso a área de membros com os
            conteúdos educacionais.
          </p>
        </div>

        <RegistrationForm
          paymentId={
            validationResult.paymentData.hublaPaymentId ||
            validationResult.paymentData.id
          }
          paymentData={validationResult}
        />
      </div>
    </div>
  );
}
