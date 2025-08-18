import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import logoImg from "@/assets/SAHAYUK-LOGO.jpg";

import { Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NotificationsList } from "./NotificationsList";

function MobileDrawerContent({ user, navigate, handleSignOut, onDrawerClose }: { user: any, navigate: any, handleSignOut: any, onDrawerClose: () => void }) {
  return (
    <div className="flex flex-col space-y-1 p-6 pt-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gradient-primary">Sahayuk</h2>
        <p className="text-sm text-muted-foreground">Milkar Kaam, Saath Mein Naam</p>
      </div>
      
      <Button variant="ghost" className="justify-start h-12 text-base" onClick={() => { navigate("/"); onDrawerClose(); }}>
        Home
      </Button>
      <Button variant="ghost" className="justify-start h-12 text-base" onClick={() => { 
        navigate("/");
        setTimeout(() => {
          const featuresElement = document.getElementById('features');
          if (featuresElement) {
            featuresElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        onDrawerClose(); 
      }}>
        Features
      </Button>
      <Button variant="ghost" className="justify-start h-12 text-base" onClick={() => { 
        navigate("/");
        setTimeout(() => {
          const pricingElement = document.getElementById('pricing');
          if (pricingElement) {
            pricingElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        onDrawerClose(); 
      }}>
        Pricing
      </Button>
      
      {user ? (
        <>
          <div className="border-t border-gray-200 my-4"></div>
          <Button variant="ghost" className="justify-start h-12 text-base" onClick={() => { navigate("/browse"); onDrawerClose(); }}>
            Browse Tasks
          </Button>
          <Button variant="ghost" className="justify-start h-12 text-base" onClick={() => { navigate("/dashboard"); onDrawerClose(); }}>
            Dashboard
          </Button>
          <Button variant="ghost" className="justify-start h-12 text-base" onClick={() => { navigate("/profile"); onDrawerClose(); }}>
            Profile
          </Button>
          <div className="border-t border-gray-200 my-4"></div>
          <Button variant="ghost" className="justify-start h-12 text-base text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => { handleSignOut(); onDrawerClose(); }}>
            Sign out
          </Button>
        </>
      ) : (
        <>
          <div className="border-t border-gray-200 my-4"></div>
          <Button variant="default" className="justify-center h-12 text-base bg-gradient-primary hover:opacity-90" onClick={() => { navigate("/auth"); onDrawerClose(); }}>
            Sign in
          </Button>
        </>
      )}
    </div>
  );
}

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
    }
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user) return;

    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null);

      if (!error) {
        setUnreadCount(count || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setDrawerOpen(false);
  };

  // Pass this to MobileDrawerContent so it can close the drawer
  const handleDrawerClose = () => setDrawerOpen(false);

  return (
    <header className="w-full sticky top-0 z-40 bg-white border-b border-gray-200 shadow-lg">
      <nav className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2 leading-none" aria-label="Sahayuk Home">
          <img
            src={logoImg}
            alt="Sahayuk logo"
            className="h-14 md:h-16 w-auto object-contain"
            loading="eager"
            decoding="async"
          />
          <span className="sr-only">Sahayuk</span>
        </a>
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/")}>Home</Button>
          <Button variant="ghost" onClick={() => {
            navigate("/");
            setTimeout(() => {
              const featuresElement = document.getElementById('features');
              if (featuresElement) {
                featuresElement.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          }}>
            Features
          </Button>
          <Button variant="ghost" onClick={() => {
            navigate("/");
            setTimeout(() => {
              const pricingElement = document.getElementById('pricing');
              if (pricingElement) {
                pricingElement.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          }}>
            Pricing
          </Button>
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <a href="/browse">Browse Tasks</a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="/dashboard">Dashboard</a>
              </Button>
              {/* Notifications - moved to side */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 bg-white border border-gray-200 shadow-xl">
                  <NotificationsList className="border-0 shadow-none" />
                </PopoverContent>
              </Popover>
              {/* Profile Dropdown with Sign Out */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt="Profile" />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-xl" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <a href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="outline" asChild>
              <a href="/auth">Sign In</a>
            </Button>
          )}
        </div>
        {/* Mobile Nav: Bell + Hamburger */}
        <div className="md:hidden flex items-center gap-2">
          {user && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 bg-white border border-gray-200 shadow-xl">
                <NotificationsList className="border-0 shadow-none" />
              </PopoverContent>
            </Popover>
          )}
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px] bg-white border-l border-gray-200">
              <MobileDrawerContent user={user} navigate={navigate} handleSignOut={handleSignOut} onDrawerClose={handleDrawerClose} />
            </SheetContent>
          </Sheet>
        </div>

      </nav>
    </header>

  );
}

export default Navbar;
