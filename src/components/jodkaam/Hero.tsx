import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/jodkaam-hero.jpg";

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const handlePostTask = async () => {
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        // User not authenticated, redirect to auth page
        toast({
          title: "Authentication Required",
          description: "Please sign in or create an account to post a task.",
        });
        navigate("/auth");
        return;
      }

      // User is authenticated - redirect to browse page where they can post tasks
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

  const handleBrowseGigs = () => {
    navigate("/browse");
  };

  return (
    <section className="relative">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10 items-center py-6 md:py-24 w-full">
        <div className="order-2 md:order-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-center md:text-left">
            JodKaam — Hyperlocal Tasks & Gigs Near You
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 text-center md:text-left">
            Post small tasks or find nearby gigs in minutes. Chat securely, get
            instant notifications, and grow with our Pro plan.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center md:justify-start" id="get-started">
            <Button variant="hero" size="lg" onClick={handlePostTask}>
              Post a Task
            </Button>
            <Button variant="secondary" size="lg" onClick={handleBrowseGigs}>
              Browse Nearby Gigs
            </Button>
          </div>
        </div>
        <div className="relative order-1 md:order-2 mb-8 md:mb-0 flex justify-center">
          <img
            src={heroImage}
            alt="JodKaam hyperlocal tasks illustration with map pins and community"
            className="w-full h-auto rounded-xl border shadow-soft"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
