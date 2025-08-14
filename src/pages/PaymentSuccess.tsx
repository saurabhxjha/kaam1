import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Home } from "lucide-react";
import { useSearchParams, Navigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const checkoutStatus = searchParams.get('checkout');

  useEffect(() => {
    // Show success message when component mounts
    if (paymentId) {
      toast({
        title: "Payment Successful! 🎉", 
        description: `Payment ID: ${paymentId}`,
      });
    } else if (checkoutStatus === 'success') {
      toast({
        title: "Payment Successful!",
        description: "Welcome to JodKaam Pro! Your subscription is now active.",
      });
    }
  }, [paymentId, checkoutStatus]);

  // Redirect to home if no payment parameters
  if (!paymentId && checkoutStatus !== 'success') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6 space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground">
              Thank you for upgrading to JodKaam Pro!
            </p>
          </div>

          {paymentId && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="w-4 h-4" />
                <span>Payment ID: {paymentId}</span>
              </div>
            </div>
          )}

          <div className="space-y-3 text-left">
            <h3 className="font-semibold">What's next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 text-green-600" />
                <span>Your Pro subscription is now active</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 text-green-600" />
                <span>Post unlimited tasks</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 text-green-600" />
                <span>Get wider visibility (up to 10km)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 text-green-600" />
                <span>Priority placement in search</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              variant="hero" 
              size="lg" 
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full"
              onClick={() => window.location.href = '/#pricing'}
            >
              View Pricing Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
