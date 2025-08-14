import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfileCheck } from "@/hooks/useProfileCheck";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const ListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-start gap-2"><Check className="mt-1" /> <span>{children}</span></li>
);

function SimplifiedPricing() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { profile, profileCompleted, tasksRemaining } = useProfileCheck(user);

  const isProUser = profile?.subscription_type === 'pro';

  const handleUpgradeToPro = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to upgrade to Pro plan.",
        variant: "destructive",
      });
      return;
    }

    if (!profileCompleted) {
      toast({
        title: "Complete Profile First",
        description: "Please complete your profile before subscribing.",
        variant: "destructive",
      });
      return;
    }

    if (isProUser) {
      toast({
        title: "Already Pro Member",
        description: "You are already a Pro member!",
      });
      return;
    }
    try {
      setLoading(true);
      console.log('🚀 Starting payment process...');

      console.log('📞 Calling create-checkout function...');

      // Create Razorpay order via Supabase function (no auth required)
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          amount: 199, // ₹199
          currency: 'INR',
        },
      });

      console.log('📋 Supabase function response:', { data, error });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(`Server Error: ${error.message || 'Function call failed'}`);
      }

      if (!data?.orderId) {
        console.error('❌ No order ID received:', data);
        throw new Error('Invalid response from payment server');
      }

      console.log('✅ Order created successfully:', data.orderId);
      
      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        console.log('📜 Loading Razorpay script...');
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Razorpay script'));
        });
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      console.log('🔑 Razorpay key:', razorpayKey?.substring(0, 10) + '...');

      if (!razorpayKey) {
        throw new Error('Razorpay key not configured');
      }

      console.log('💳 Opening Razorpay checkout...');

      // Open Razorpay checkout
      const options = {
        key: razorpayKey,
        amount: 199 * 100, // Amount in paise
        currency: 'INR',
        name: 'JodKaam',
        description: 'Pro Subscription - ₹199/month',
        order_id: data.orderId,
        handler: async function (response: any) {
          console.log('✅ Payment successful:', response);
          
          try {
            // Update subscribers table first
            const { error: subscribersError } = await supabase
              .from('subscribers')
              .upsert({ 
                user_id: user.id,
                email: user.email,
                subscribed: true,
                subscription_tier: 'pro',
                updated_at: new Date().toISOString()
              });

            if (subscribersError) {
              console.error('Failed to update subscribers table:', subscribersError);
            } else {
              console.log('✅ Subscribers table updated successfully');
            }

            // Update user profile to Pro in both database and localStorage
            if (profile) {
              // Update in Supabase
              const { error } = await supabase
                .from('user_profiles')
                .update({ 
                  subscription_type: 'pro',
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id);

              if (error) {
                console.error('Failed to update subscription in database:', error);
              } else {
                console.log('✅ User profile updated to Pro');
              }
              
              // Always update localStorage as backup
              const updatedProfile = {
                ...profile,
                subscription_type: 'pro',
                updated_at: new Date().toISOString()
              };
              localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
            }
          } catch (updateError) {
            console.error('Error updating subscription:', updateError);
            // Still update localStorage as fallback
            if (profile) {
              const updatedProfile = {
                ...profile,
                subscription_type: 'pro',
                updated_at: new Date().toISOString()
              };
              localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
            }
          }
          
          toast({
            title: "Payment Successful! 🎉",
            description: "Welcome to JodKaam Pro! Your subscription is now active.",
          });
          
          // Redirect to success page
          window.location.href = '/?payment=success';
        },
        prefill: {
          name: 'JodKaam User',
          email: 'user@jodkaam.com',
          contact: ''
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            console.log('🚫 Payment dismissed by user');
            toast({
              title: "Payment Cancelled",
              description: "Payment was cancelled. You can try again anytime.",
              variant: "destructive",
            });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
        
    } catch (error) {
      console.error('💥 Error in handleUpgradeToPro:', error);
      
      let errorMessage = "Something went wrong. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('Server Error')) {
          errorMessage = error.message;
        } else if (error.message.includes('Razorpay')) {
          errorMessage = "Payment system unavailable. Please check your connection.";
        } else if (error.message.includes('Invalid response')) {
          errorMessage = "Server communication error. Please try again.";
        }
      }
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          Start free. Upgrade to Pro for unlimited posting and wider visibility.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-4xl font-extrabold tracking-tight">₹0</div>
              <ul className="space-y-2 text-muted-foreground">
                <ListItem>Post up to 3 tasks/month</ListItem>
                <ListItem>Local radius visibility (1–2 km)</ListItem>
                <ListItem>Secure in-app chat</ListItem>
              </ul>
              {user && profile && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium">
                    Tasks Remaining: <span className="text-blue-600">{tasksRemaining}/3</span>
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="lg"
                disabled={!user || !profileCompleted}
                className="w-full"
              >
                {!user ? "Sign In Required" : !profileCompleted ? "Complete Profile" : "Current Plan"}
              </Button>
            </CardFooter>
          </Card>

          <Card className={`surface-card border-2 ${isProUser ? 'border-green-500 bg-green-50' : 'border-ring'}`}>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center justify-between">
                Pro
                {isProUser && <span className="text-sm bg-green-500 text-white px-2 py-1 rounded">Active</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-4xl font-extrabold tracking-tight">₹199/mo</div>
              <ul className="space-y-2 text-muted-foreground">
                <ListItem>Unlimited task posting</ListItem>
                <ListItem>Wider visibility up to 10 km</ListItem>
                <ListItem>Priority placement</ListItem>
              </ul>
              {isProUser && (
                <div className="mt-4 p-3 bg-green-100 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    ✅ You have unlimited access to all Pro features!
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant={isProUser ? "outline" : "hero"} 
                size="lg" 
                onClick={handleUpgradeToPro}
                disabled={loading || isProUser || !user || !profileCompleted}
                className="w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Processing..." : 
                 isProUser ? "Pro Member" : 
                 !user ? "Sign In Required" : 
                 !profileCompleted ? "Complete Profile" : 
                 "Go Pro"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default SimplifiedPricing;
