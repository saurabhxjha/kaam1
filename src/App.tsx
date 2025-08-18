import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Navbar from "@/components/jodkaam/Navbar";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Browse from "./pages/Browse";
import Dashboard from "./pages/Dashboard";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { useProfileCheck } from "./hooks/useProfileCheck";
import ProfileForm from "./components/jodkaam/ProfileForm";
import ProfileDisplay from "./components/jodkaam/ProfileDisplay";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, profileCompleted, refreshProfile } = useProfileCheck(user);

  // Check database on startup
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        // Try to make a simple query to check if user_profiles table exists
        const response = await fetch('https://baipdmbxmlywavyxkjbf.supabase.co/rest/v1/user_profiles?select=count', {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhaXBkbWJ4bWx5d2F2eXhramJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjc2MTcsImV4cCI6MjA3MDYwMzYxN30.EswsvKg3tXe6QoysWhF7JVqfLbGV7f2vFs0hQJgLeE0',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhaXBkbWJ4bWx5d2F2eXhramJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjc2MTcsImV4cCI6MjA3MDYwMzYxN30.EswsvKg3tXe6QoysWhF7JVqfLbGV7f2vFs0hQJgLeE0'
          }
        });
        
        if (response.ok) {
          console.log('✅ Database connection successful - user_profiles table exists');
        } else {
          console.log('⚠️  Database table not found - falling back to localStorage');
          console.log('🔗 For cross-device sync, please run migration: https://supabase.com/dashboard/project/baipdmbxmlywavyxkjbf/sql');
        }
      } catch (error) {
        console.log('⚠️  Database connection failed - using localStorage fallback');
      }
    };
    
    checkDatabase();
  }, []);

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center p-8 glass-panel rounded-2xl shadow-soft">
          <div className="relative mb-6">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <div className="absolute inset-0 w-12 h-12 mx-auto rounded-full border-2 border-primary/20 animate-pulse"></div>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gradient-primary">Sahayuk</h3>
          <p className="text-muted-foreground text-sm">Setting up your workspace...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated but profile not completed, show profile form
  if (user && !profileCompleted) {
    return <ProfileForm user={user} onProfileComplete={refreshProfile} />;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route 
          path="/auth" 
          element={user ? <Navigate to="/" replace /> : <Auth />} 
        />
        <Route path="/browse" element={<Browse />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route 
          path="/profile" 
          element={
            user ? 
            <ProfileDisplay 
              user={user} 
              onEditProfile={() => {
                // For now, just refresh the page - in future this can open edit form
                window.location.href = '/profile/edit';
              }} 
            /> : 
            <Navigate to="/auth" replace />
          } 
        />
        <Route 
          path="/profile/edit" 
          element={
            user ? 
            <ProfileForm 
              user={user} 
              onProfileComplete={() => window.location.href = '/profile'} 
              isEdit={true}
            /> : 
            <Navigate to="/auth" replace />
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
