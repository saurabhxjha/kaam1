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
  <Card className="surface-card transition-transform duration-200 hover:-translate-y-1">
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
    <section id="features" className="py-16 md:py-24">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Features</h2>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          Everything you need to connect local help with nearby tasks — fast,
          reliable, and secure.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<MapPin className="text-foreground/80" />}
            title="Hyperlocal Browse"
            description="See gigs around you with precise radius control. Pro users get wider visibility."
            actionButton={
              <Button onClick={handleBrowseGigs} variant="outline" size="sm">
                Browse Gigs
              </Button>
            }
          />
          <FeatureCard
            icon={<MessageSquare className="text-foreground/80" />}
            title="In-app Chat"
            description="Once matched, chat securely to align on details and timelines."
          />
          <FeatureCard
            icon={<Bell className="text-foreground/80" />}
            title="Instant Notifications"
            description="Stay updated with new tasks, bids, and messages in real time."
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
