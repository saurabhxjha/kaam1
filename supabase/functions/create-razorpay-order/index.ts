import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-RAZORPAY-ORDER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create a Supabase client using the anon key for user auth
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_live_DNOOOsu0jOhrwh";
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || "d3S7u05xOEvyA6hq65IzX0Ga";
    
    if (!razorpayKeySecret) throw new Error("RAZORPAY_KEY_SECRET is not set");
    logStep("Razorpay keys verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { amount, currency = "INR" } = await req.json();
    if (!amount) throw new Error("Amount is required");

    // Create Razorpay order using fetch API
    const orderPayload = {
      amount: amount * 100, // Convert to paise
      currency: currency,
      receipt: `receipt_${user.id}_${Date.now()}`,
      notes: {
        user_id: user.id,
        user_email: user.email,
        plan: "pro_monthly"
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
    logStep("ERROR in create-razorpay-order", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});