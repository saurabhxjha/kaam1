import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Home, Crown, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import SignatureBackground from "@/components/jodkaam/SignatureBackground";

export const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    toast({
      title: "Payment Successful!",
      description: "Welcome to Sahayuk Pro! Your subscription is now active.",
    });
  }, []);

  return (
    <SignatureBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center glass-panel shadow-glow border-0">
          <CardHeader className="pb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-glow">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gradient-primary mb-2">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-lg">
              Welcome to Sahayuk Pro! Your subscription is now active.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-green-800">Pro Features Unlocked</h3>
              </div>
              <ul className="text-sm text-green-700 space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Unlimited task posting
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Extended visibility (up to 10km)
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Advanced analytics
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => navigate("/dashboard")}
                className="flex-1 h-12 font-semibold bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glow"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1 h-12 font-semibold"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SignatureBackground>
  );
};
