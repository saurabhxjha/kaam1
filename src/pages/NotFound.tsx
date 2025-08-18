import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SignatureBackground from "@/components/jodkaam/SignatureBackground";
import { Home, Search } from "lucide-react";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SignatureBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow">
            <Search className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-gradient-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Oops! Page Not Found</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            The page you're looking for seems to have wandered off. Let's get you back on track!
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/")} 
              className="w-full h-12 font-semibold bg-gradient-primary hover:opacity-90 transition-all duration-200 shadow-glow"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/browse")} 
              className="w-full h-12 font-semibold"
            >
              Browse Tasks
            </Button>
          </div>
        </div>
      </div>
    </SignatureBackground>
  );
};

export default NotFound;
