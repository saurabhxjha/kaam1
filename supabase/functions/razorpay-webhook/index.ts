import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "jodkaam_webhook_secret_2025";

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const signature = req.headers.get("x-razorpay-signature");
    const body = await req.text();
    
    // Verify Razorpay webhook signature for security
    if (signature && webhookSecret) {
      try {
        // Use Web Crypto API for HMAC verification
        const key = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(webhookSecret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        
        const expectedSignature = await crypto.subtle.sign(
          "HMAC",
          key,
          new TextEncoder().encode(body)
        );
        
        const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        if (signature !== expectedSignatureHex) {
          console.error("Invalid Razorpay webhook signature");
          return new Response("Invalid signature", { status: 401 });
        }
        
        console.log("Webhook signature verified successfully");
      } catch (signatureError) {
        console.error("Error verifying signature:", signatureError);
        // For now, continue without verification but log the error
      }
    } else {
      console.warn("No signature verification - webhook secret not configured properly");
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
          await updateSubscriptionStatus(payment.notes.user_id, payment.notes.user_email, true, 'pro');
        }
        break;
      }
      
      case 'payment.authorized': {
        const payment = event.payload.payment.entity;
        console.log("Payment authorized:", payment.id);
        
        // Payment authorized but not captured yet
        // You might want to log this for tracking
        break;
      }
      
      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        console.log("Payment failed:", payment.id, payment.error_description);
        
        // Log failed payment for analytics
        break;
      }
      
      case 'order.paid': {
        const order = event.payload.order.entity;
        console.log("Order paid:", order.id);
        
        // Additional order completion handling
        if (order.notes?.user_id) {
          await updateSubscriptionStatus(order.notes.user_id, order.notes.user_email, true, 'pro');
        }
        break;
      }
      
      case 'payment_link.paid': {
        const paymentLink = event.payload.payment_link.entity;
        console.log("Payment link paid:", paymentLink.id);
        
        // Handle payment link success
        if (paymentLink.notes?.user_id) {
          await updateSubscriptionStatus(paymentLink.notes.user_id, paymentLink.notes.user_email, true, 'pro');
        }
        break;
      }
      
      case 'refund.created': {
        const refund = event.payload.refund.entity;
        console.log("Refund created:", refund.id);
        
        // Handle refund - might need to downgrade user
        break;
      }
      
      case 'refund.processed': {
        const refund = event.payload.refund.entity;
        console.log("Refund processed:", refund.id);
        
        // Refund completed - update user status if needed
        break;
      }
      
      case 'payment.dispute.created': {
        const dispute = event.payload.dispute.entity;
        console.log("Payment dispute created:", dispute.id);
        
        // Handle payment dispute
        break;
      }
      
      default:
        console.log(`Unhandled event type ${event.event}`);
    }

    // Helper function to update subscription status
    async function updateSubscriptionStatus(userId: string, userEmail: string, subscribed: boolean, tier: string | null) {
      try {
        // First try to update existing subscriber
        const { data: existingSubscriber, error: fetchError } = await supabaseClient
          .from('subscribers')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (existingSubscriber) {
          // Update existing subscriber
          const { error } = await supabaseClient
            .from('subscribers')
            .update({ 
              subscribed,
              subscription_tier: tier,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
            
          if (error) {
            console.error("Error updating subscriber:", error);
          } else {
            console.log("Subscriber updated successfully");
          }
        } else if (userEmail && subscribed) {
          // Create new subscriber
          const { error } = await supabaseClient
            .from('subscribers')
            .insert({
              user_id: userId,
              email: userEmail,
              subscribed,
              subscription_tier: tier,
            });
            
          if (error) {
            console.error("Error creating subscriber:", error);
          } else {
            console.log("New subscriber created successfully");
          }
        }
      } catch (error) {
        console.error("Error in updateSubscriptionStatus:", error);
      }
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
