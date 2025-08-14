import React from "react";
import { useAuth } from "@/hooks/useAuth";
import UserDashboard from "@/components/jodkaam/UserDashboard";
import SignatureBackground from "@/components/jodkaam/SignatureBackground";

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <SignatureBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </SignatureBackground>
    );
  }

  if (!user) {
    return (
      <SignatureBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to access your dashboard.
            </p>
            <a
              href="/auth"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Sign In
            </a>
          </div>
        </div>
      </SignatureBackground>
    );
  }

  return (
    <SignatureBackground>
      <UserDashboard />
    </SignatureBackground>
  );
};

export default Dashboard;
