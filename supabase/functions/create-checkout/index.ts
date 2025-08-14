/// <reference types="https://esm.sh/@types/deno@1.36.0/index.d.ts" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_live_DNOOOsu0jOhrwh";
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || "d3S7u05xOEvyA6hq65IzX0Ga";
    
    if (!razorpayKeySecret) throw new Error("RAZORPAY_KEY_SECRET is not set");
    logStep("Razorpay keys verified");

    const { amount, currency = "INR" } = await req.json();
    if (!amount) throw new Error("Amount is required");

    // Create Razorpay order using fetch API
    const orderPayload = {
      amount: amount * 100, // Convert to paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan: "pro_monthly",
        amount: amount
      }
    };

    const authString = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.text();
      throw new Error(`Razorpay order creation failed: ${errorData}`);
    }

    const order = await orderResponse.json();
    logStep("Razorpay order created", { orderId: order.id, amount: order.amount });

    return new Response(JSON.stringify({ 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});