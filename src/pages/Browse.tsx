import React from "react";
import { useAuth } from "@/hooks/useAuth";
import BrowseGigs from "@/components/jodkaam/BrowseGigs";
import SignatureBackground from "@/components/jodkaam/SignatureBackground";
import { MapPin } from "lucide-react";

const BrowsePage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <SignatureBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 glass-panel rounded-2xl shadow-soft">
            <div className="relative mb-6">
              <div className="w-12 h-12 mx-auto border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gradient-primary">Loading Tasks</h3>
            <p className="text-muted-foreground text-sm">Finding gigs near you...</p>
          </div>
        </div>
      </SignatureBackground>
    );
  }

  if (!user) {
    return (
      <SignatureBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-gradient-primary">Ready to Explore?</h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Sign in to discover amazing tasks and gigs happening right in your neighborhood.
            </p>
            <div className="space-y-4">
              <a
                href="/auth"
                className="inline-flex items-center justify-center rounded-xl text-base font-semibold bg-gradient-primary text-white hover:opacity-90 transition-all duration-200 shadow-glow h-12 px-8 py-3 w-full"
              >
                Get Started
              </a>
              <p className="text-sm text-muted-foreground">
                Join thousands earning money with local tasks
              </p>
            </div>
          </div>
        </div>
      </SignatureBackground>
    );
  }

  return (
    <SignatureBackground>
      <BrowseGigs />
    </SignatureBackground>
  );
};

export default BrowsePage;
