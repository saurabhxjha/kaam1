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
      <div className="container grid md:grid-cols-2 gap-10 items-center py-16 md:py-24">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            JodKaam — Hyperlocal Tasks & Gigs Near You
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Post small tasks or find nearby gigs in minutes. Chat securely, get
            instant notifications, and grow with our Pro plan.
          </p>
          <div className="flex flex-wrap gap-3" id="get-started">
            <Button variant="hero" size="lg" onClick={handlePostTask}>
              Post a Task
            </Button>
            <Button variant="secondary" size="lg" onClick={handleBrowseGigs}>
              Browse Nearby Gigs
            </Button>
          </div>
        </div>
        <div className="relative">
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
