"use client";

import React, { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

interface FedaPayButtonProps {
  amount: number;
  studentName: string;
  parentPhone?: string;
  parentEmail?: string;
  description?: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
}

/**
 * FedaPay Payment Button
 * Creates a server-side transaction and redirects to the FedaPay payment page.
 */
export function FedaPayButton({
  amount,
  studentName,
  parentPhone,
  parentEmail,
  description,
  onSuccess,
  onError,
}: FedaPayButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (amount <= 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/fedapay/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "XOF",
          description: description || `Paiement scolarité — ${studentName}`,
          customer_name: studentName,
          customer_email: parentEmail || "",
          customer_phone: parentPhone || "",
          callback_url: typeof window !== "undefined" ? `${window.location.origin}/payments` : "",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Échec de la création du paiement FedaPay.");
      }

      onSuccess?.(data.transaction_id);

      // Redirect to FedaPay payment page
      if (data.payment_url) {
        window.open(data.payment_url, "_blank");
      }
    } catch (err: any) {
      const msg = err?.message || "Erreur lors du paiement FedaPay.";
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading || amount <= 0}
      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#1D3557] hover:bg-[#152a45] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Création du paiement...</span>
        </>
      ) : (
        <>
          <ExternalLink className="w-4 h-4" />
          <span>Payer {amount.toLocaleString("fr-FR")} FCFA via FedaPay</span>
        </>
      )}
    </button>
  );
}
