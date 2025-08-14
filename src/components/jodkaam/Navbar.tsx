import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NotificationsList } from "./NotificationsList";

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

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
  };

  return (
    <header className="w-full sticky top-0 z-40 bg-background/80 backdrop-blur border-b">
      <nav className="container flex items-center justify-between h-16">
        <a href="/" className="font-bold text-lg leading-none">
          <span className="text-gradient-primary">JodKaam</span>
        </a>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/", { state: { scrollTo: "features" } })}>
            Features
          </Button>
          <Button variant="ghost" onClick={() => navigate("/", { state: { scrollTo: "pricing" } })}>
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
                <PopoverContent className="w-80 p-0">
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
                <DropdownMenuContent className="w-56" align="end" forceMount>
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
      </nav>
    </header>
  );
};

export default Navbar;
