import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, MessageSquare, Bell } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  actionButton?: React.ReactNode;
}> = ({ icon, title, description, actionButton }) => (
  <Card className="bg-white rounded-2xl shadow-lg border-0 transition-transform duration-200 hover:-translate-y-1">
    <CardHeader>
      <CardTitle className="flex items-center gap-3 text-xl">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="text-muted-foreground">
      {description}
      {actionButton && <div className="mt-4">{actionButton}</div>}
    </CardContent>
  </Card>
);

const Features: React.FC = () => {
  const navigate = useNavigate();

  const handleBrowseGigs = async () => {
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        // User not authenticated, redirect to auth page
        toast({
          title: "Authentication Required",
          description: "Please sign in or create an account to browse gigs.",
        });
        navigate("/auth");
        return;
      }

      // User is authenticated - redirect to browse page
      navigate("/browse");
    } catch (error) {
      console.error('Error checking authentication:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };
  return (
    <section id="features" className="py-16 md:py-28 bg-gray-50 border-t border-b border-gray-100">
      <div className="w-full max-w-6xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-center text-gray-900">Core Features</h2>
        <p className="text-lg md:text-xl text-gray-600 mb-12 text-center max-w-2xl mx-auto">
          Everything you need to connect local help with nearby tasks — fast, reliable, and secure.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 text-3xl shadow-md"><MapPin /></span>}
            title="Hyperlocal Browse"
            description="See gigs around you with precise radius control. Pro users get wider visibility."
            actionButton={
              <Button onClick={handleBrowseGigs} variant="outline" size="sm" className="rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold">
                Browse Gigs
              </Button>
            }
          />
          <FeatureCard
            icon={<span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 text-3xl shadow-md"><MessageSquare /></span>}
            title="In-app Chat"
            description="Once matched, chat securely to align on details and timelines."
            actionButton={
              <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} variant="outline" size="sm" className="rounded-full bg-green-50 text-green-700 hover:bg-green-100 font-semibold">
                Try Chat
              </Button>
            }
          />
          <FeatureCard
            icon={<span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-yellow-100 text-yellow-600 text-3xl shadow-md"><Bell /></span>}
            title="Instant Notifications"
            description="Stay updated with new tasks, bids, and messages in real time."
            actionButton={
              <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} variant="outline" size="sm" className="rounded-full bg-yellow-50 text-yellow-700 hover:bg-yellow-100 font-semibold">
                See Alerts
              </Button>
            }
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
