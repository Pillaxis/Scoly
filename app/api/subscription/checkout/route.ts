import { NextRequest, NextResponse } from "next/server";
import { PLAN_PRICING } from "@/lib/subscription/features";
import { SubscriptionPlan, SubscriptionBillingPeriod } from "@/types/subscription";

/**
 * Endpoint de création de transaction FedaPay pour l'abonnement SCOLY
 * 
 * Calcule avec exactitude le montant :
 * - START mensuel : 5 000 FCFA
 * - START annuel : 42 000 FCFA (-30%)
 * - PRO mensuel : 10 000 FCFA
 * - PRO annuel : 84 000 FCFA (-30%)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      school_id,
      school_name,
      plan,
      billing_period,
      customer_name,
      customer_email,
      customer_phone,
      callback_url,
    } = body as {
      school_id: string;
      school_name?: string;
      plan: SubscriptionPlan;
      billing_period: SubscriptionBillingPeriod;
      customer_name?: string;
      customer_email?: string;
      customer_phone?: string;
      callback_url?: string;
    };

    if (!school_id || !plan || !billing_period) {
      return NextResponse.json(
        { error: "Paramètres manquants (school_id, plan, billing_period requis)" },
        { status: 400 }
      );
    }

    if (plan !== "start" && plan !== "pro") {
      return NextResponse.json({ error: "Forfait invalide (start ou pro attendu)" }, { status: 400 });
    }

    if (billing_period !== "monthly" && billing_period !== "yearly") {
      return NextResponse.json({ error: "Période invalide (monthly ou yearly attendu)" }, { status: 400 });
    }

    // Calcul exact du montant
    const amount = PLAN_PRICING[plan][billing_period];
    const planName = plan === "pro" ? "SCOLY PRO" : "SCOLY START";
    const periodName = billing_period === "yearly" ? "Annuel (-30%)" : "Mensuel";
    const description = `Abonnement ${planName} — Formule ${periodName} (${school_name || "Établissement"})`;

    const secretKey = process.env.FEDAPAY_SECRET_KEY;
    const fedapayEnv = process.env.NEXT_PUBLIC_FEDAPAY_ENV || "sandbox";

    // Si les clés FedaPay ne sont pas configurées, mode simulation de paiement sécurisé
    if (!secretKey) {
      const mockTransactionId = `MOCK-TX-${Date.now()}`;
      return NextResponse.json({
        success: true,
        is_mock: true,
        transaction_id: mockTransactionId,
        amount,
        plan,
        billing_period,
        description,
        message: "Mode simulation actif (FEDAPAY_SECRET_KEY non configuré).",
      });
    }

    const baseUrl =
      fedapayEnv === "live"
        ? "https://api.fedapay.com/v1"
        : "https://sandbox-api.fedapay.com/v1";

    // 1. Créer la transaction FedaPay
    const transactionRes = await fetch(`${baseUrl}/transactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
        amount: Math.round(amount),
        currency: "XOF",
        callback_url: callback_url || "",
        custom_metadata: {
          school_id,
          plan,
          billing_period,
          type: "scoly_subscription",
        },
        customer: {
          firstname: customer_name || "Directeur",
          lastname: "",
          email: customer_email || "contact@scoly.tg",
          phone_number: {
            number: customer_phone || "+22890000000",
            country: "TG",
          },
        },
      }),
    });

    if (!transactionRes.ok) {
      const errData = await transactionRes.text();
      console.error("[FedaPay Subscription] Transaction creation failed:", errData);
      return NextResponse.json(
        { error: "Échec de l'initialisation du paiement FedaPay." },
        { status: 502 }
      );
    }

    const transactionData = await transactionRes.json();
    const transactionId = transactionData?.v1?.transaction?.id;

    if (!transactionId) {
      return NextResponse.json(
        { error: "ID de transaction manquant dans la réponse FedaPay." },
        { status: 502 }
      );
    }

    // 2. Générer le token de paiement
    const tokenRes = await fetch(`${baseUrl}/transactions/${transactionId}/token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.text();
      console.error("[FedaPay Subscription] Token generation failed:", errData);
      return NextResponse.json(
        { error: "Échec de la génération du lien de paiement FedaPay." },
        { status: 502 }
      );
    }

    const tokenData = await tokenRes.json();
    const paymentUrl = tokenData?.url || tokenData?.token;

    return NextResponse.json({
      success: true,
      transaction_id: transactionId,
      payment_url: paymentUrl,
      amount,
      plan,
      billing_period,
    });
  } catch (err: any) {
    console.error("[FedaPay Subscription Checkout] Error:", err);
    return NextResponse.json(
      { error: err.message || "Erreur serveur lors de la commande." },
      { status: 500 }
    );
  }
}
