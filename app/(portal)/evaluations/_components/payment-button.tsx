"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { PaymentModal } from "./payment-modal";

interface PaymentButtonProps {
  platform: string;
  evaluationId: string;
  renewalType: "evaluation" | "paid_account";
}

export function PaymentButton({
  platform,
  evaluationId,
  renewalType,
}: PaymentButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="bg-green-600 hover:bg-green-700"
      >
        <CreditCard className="mr-2 h-4 w-4" />
        Pagar Plataforma
      </Button>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        platform={platform}
        evaluationId={evaluationId}
        renewalType={renewalType}
      />
    </>
  );
}
