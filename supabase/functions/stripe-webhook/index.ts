import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHash } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || "d3S7u05xOEvyA6hq65IzX0Ga";

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const signature = req.headers.get("x-razorpay-signature");
    const body = await req.text();
    
    // Verify Razorpay webhook signature
    if (signature) {
      const expectedSignature = createHash("sha256")
        .update(body + razorpayKeySecret)
        .digest("hex");
      
      if (signature !== expectedSignature) {
        console.error("Invalid Razorpay signature");
        return new Response("Invalid signature", { status: 400 });
      }
    }

    let event;
    try {
      event = JSON.parse(body);
    } catch (err) {
      console.error("Error parsing webhook body:", err);
      return new Response("Invalid JSON", { status: 400 });
    }

    console.log("Received Razorpay event:", event.event);

    // Handle different Razorpay events
    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        console.log("Payment captured:", payment.id);
        
        // Update user subscription status
        if (payment.notes?.user_id) {
          // First try to update existing subscriber
          const { data: existingSubscriber, error: fetchError } = await supabaseClient
            .from('subscribers')
            .select('id')
            .eq('user_id', payment.notes.user_id)
            .single();

          if (existingSubscriber) {
            // Update existing subscriber
            const { error } = await supabaseClient
              .from('subscribers')
              .update({ 
                subscribed: true,
                subscription_tier: 'pro',
                updated_at: new Date().toISOString()
              })
              .eq('user_id', payment.notes.user_id);
              
            if (error) {
              console.error("Error updating subscriber:", error);
            } else {
              console.log("Subscriber updated successfully");
            }
          } else if (payment.notes.user_email) {
            // Create new subscriber
            const { error } = await supabaseClient
              .from('subscribers')
              .insert({
                user_id: payment.notes.user_id,
                email: payment.notes.user_email,
                subscribed: true,
                subscription_tier: 'pro',
              });
              
            if (error) {
              console.error("Error creating subscriber:", error);
            } else {
              console.log("New subscriber created successfully");
            }
          }
        }
        break;
      }
      
      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        console.log("Payment failed:", payment.id);
        
        // Handle failed payment if needed
        break;
      }
      
      case 'subscription.cancelled': {
        const subscription = event.payload.subscription.entity;
        console.log("Subscription cancelled:", subscription.id);
        
        // Update subscription status to cancelled
        if (subscription.notes?.user_id) {
          const { error } = await supabaseClient
            .from('subscribers')
            .update({ 
              subscribed: false,
              subscription_tier: null,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', subscription.notes.user_id);
            
          if (error) {
            console.error("Error updating subscription to cancelled:", error);
          }
        }
        break;
      }
      
      default:
        console.log(`Unhandled event type ${event.event}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook handler failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
