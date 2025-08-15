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
    <section className="relative flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center py-12 md:py-20 w-full max-w-7xl mx-auto px-4">
        <div className="order-2 md:order-1">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-center md:text-left text-gray-900">
            JodKaam <span className="text-blue-600">— Hyperlocal Tasks & Gigs Near You</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-6 text-center md:text-left max-w-xl">
            Post small tasks or find nearby gigs in minutes. Chat securely, get instant notifications, and grow with our Pro plan.
          </p>
          <div className="flex justify-center md:justify-start mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold text-sm shadow-sm">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
              Trusted by 10,000+ users
            </span>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center md:justify-start" id="get-started">
            <Button variant="hero" size="lg" onClick={handlePostTask} className="font-bold px-8 py-4">
              Post a Task
            </Button>
            <Button variant="secondary" size="lg" onClick={handleBrowseGigs} className="font-bold px-8 py-4">
              Browse Nearby Gigs
            </Button>
          </div>
        </div>
        <div className="relative order-1 md:order-2 mb-8 md:mb-0 flex justify-center">
          <div className="w-full max-w-md animate-float">
            <img
              src={heroImage}
              alt="JodKaam hyperlocal tasks illustration with map pins and community"
              className="w-full h-auto rounded-2xl border shadow-lg"
              decoding="async"
            />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;
