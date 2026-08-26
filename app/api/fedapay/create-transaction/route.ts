import { NextRequest, NextResponse } from "next/server";

/**
 * FedaPay Transaction Creation API Route
 * 
 * Creates a FedaPay payment transaction server-side.
 * The secret key is never exposed to the browser.
 * 
 * Body: { amount, currency, description, customer_name, customer_email, customer_phone, callback_url }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { amount, currency, description, customer_name, customer_email, customer_phone, callback_url } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Le montant doit être supérieur à 0." }, { status: 400 });
    }

    const secretKey = process.env.FEDAPAY_SECRET_KEY;
    const fedapayEnv = process.env.NEXT_PUBLIC_FEDAPAY_ENV || "sandbox";

    if (!secretKey) {
      return NextResponse.json(
        { error: "FedaPay n'est pas configuré. Ajoutez FEDAPAY_SECRET_KEY dans .env.local." },
        { status: 500 }
      );
    }

    const baseUrl =
      fedapayEnv === "live"
        ? "https://api.fedapay.com/v1"
        : "https://sandbox-api.fedapay.com/v1";

    // 1. Create the transaction
    const transactionRes = await fetch(`${baseUrl}/transactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: description || "Paiement de scolarité SCOLY",
        amount: Math.round(amount),
        currency: currency || "XOF",
        callback_url: callback_url || "",
        customer: {
          firstname: customer_name || "Élève",
          lastname: "",
          email: customer_email || "",
          phone_number: {
            number: customer_phone || "",
            country: "TG",
          },
        },
      }),
    });

    if (!transactionRes.ok) {
      const errData = await transactionRes.text();
      console.error("[FedaPay] Transaction creation failed:", errData);
      return NextResponse.json(
        { error: "Échec de la création de la transaction FedaPay." },
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

    // 2. Generate the payment token/URL
    const tokenRes = await fetch(`${baseUrl}/transactions/${transactionId}/token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.text();
      console.error("[FedaPay] Token generation failed:", errData);
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
    });
  } catch (err: any) {
    console.error("[FedaPay] Unexpected error:", err);
    return NextResponse.json(
      { error: "Erreur serveur interne lors de la création FedaPay." },
      { status: 500 }
    );
  }
}
