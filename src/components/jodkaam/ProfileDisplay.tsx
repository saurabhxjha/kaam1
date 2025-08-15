import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReviewsDisplay } from "./ReviewsDisplay";
import { 
  User, 
  Phone, 
  MapPin, 
  Mail, 
  Calendar,
  Crown,
  Star,
  Edit,
  CheckCircle,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

interface ProfileDisplayProps {
  user: any;
  onEditProfile?: () => void;
}

const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ user, onEditProfile }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Try to get profile from Supabase first
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      } else {
        // Fallback to localStorage for existing users
        const profileKey = `profile_${user.id}`;
        const storedProfile = localStorage.getItem(profileKey);
        
        if (storedProfile) {
          const data = JSON.parse(storedProfile);
          setProfile(data);
        }
      }

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching profile:', error);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    // Navigate to home page with pricing section
    navigate('/', { state: { scrollTo: 'pricing' } });
    
    // Add a small delay and scroll to pricing section
    setTimeout(() => {
      const pricingElement = document.getElementById('pricing');
      if (pricingElement) {
        pricingElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  if (loading) {
    return (
  <div className="p-4 md:p-6 w-full">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const isPro = profile.subscription_type === 'pro';
  const tasksRemaining = isPro ? 'Unlimited' : Math.max(0, 3 - profile.tasks_posted_this_month);

  return (
  <div className="p-4 md:p-6 space-y-4 md:space-y-6 w-full">
      {/* Header Card */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.profile_image} />
              <AvatarFallback className="text-lg">
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2">
              <CardTitle className="text-2xl">
                {profile.first_name} {profile.last_name}
              </CardTitle>
              
              <div className="flex items-center justify-center space-x-2">
                <Badge variant={isPro ? "default" : "secondary"} className="flex items-center space-x-1">
                  {isPro ? <Crown className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                  <span>{isPro ? 'Pro Member' : 'Free Member'}</span>
                </Badge>
                
                {profile.profile_completed && (
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Verified</span>
                  </Badge>
                )}
              </div>
            </div>

            <Button variant="outline" onClick={onEditProfile} className="flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{profile.phone || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">
                  {profile.city ? `${profile.address}, ${profile.city}` : 'Not provided'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{profile.bio}</p>
            </div>
          )}

          {/* Skills */}
          {profile.skills && (
            <div>
              <h3 className="font-semibold mb-2">Skills</h3>
              <p className="text-muted-foreground">{profile.skills}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isPro ? <Crown className="w-5 h-5 text-yellow-500" /> : <Star className="w-5 h-5" />}
            <span>Subscription Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{tasksRemaining}</p>
              <p className="text-sm text-muted-foreground">Tasks Remaining</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold">{isPro ? '10km' : '2km'}</p>
              <p className="text-sm text-muted-foreground">Visibility Radius</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold">{isPro ? 'High' : 'Normal'}</p>
              <p className="text-sm text-muted-foreground">Priority Level</p>
            </div>
          </div>
          
          {!isPro && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2">🚀 Upgrade to Pro</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Get unlimited task posting, wider reach, and priority placement for just ₹199/month
              </p>
              <Button size="sm" className="w-full" onClick={handleUpgradeClick}>
                Upgrade Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <ReviewsDisplay 
        userId={user.id} 
        className="mt-6"
      />
    </div>
  );
};

export default ProfileDisplay;
