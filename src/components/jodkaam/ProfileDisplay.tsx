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
      <div className="w-full max-w-2xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
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
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
      {/* Profile Header */}
      <Card className="overflow-visible shadow-xl border-0 bg-gradient-to-br from-white via-blue-50 to-indigo-100">
        <CardContent className="pt-6 pb-6 px-4 sm:px-6 flex flex-col items-center relative">
          <div className="relative w-24 sm:w-28 h-24 sm:h-28 mb-4">
            <Avatar className="w-24 sm:w-28 h-24 sm:h-28 border-4 border-white shadow-xl">
              <AvatarImage src={profile.profile_image} />
              <AvatarFallback className="text-xl sm:text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              onClick={onEditProfile}
              className="absolute -bottom-1 -right-1 rounded-full p-2 bg-white border-2 border-blue-200 shadow-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              size="icon"
              aria-label="Edit Profile"
            >
              <Edit className="w-4 h-4 text-blue-600" />
            </Button>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
            {profile.first_name} {profile.last_name}
          </CardTitle>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <Badge variant={isPro ? "default" : "secondary"} className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
              {isPro ? <Crown className="w-4 h-4" /> : <Star className="w-4 h-4" />}
              <span>{isPro ? 'Pro Member' : 'Free Member'}</span>
            </Badge>
            {profile.profile_completed && (
              <Badge variant="outline" className="flex items-center gap-1 border-green-400 text-green-700 bg-green-50 px-3 py-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>Verified</span>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact & Info */}
      <Card className="shadow-lg border border-gray-200 bg-white">
        <CardContent className="py-6 px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <div className="p-2 rounded-full bg-blue-500">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">Email</p>
                <p className="font-semibold text-sm text-gray-900 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
              <div className="p-2 rounded-full bg-green-500">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">Phone</p>
                <p className="font-semibold text-sm text-gray-900">{profile.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
              <div className="p-2 rounded-full bg-purple-500">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">Location</p>
                <p className="font-semibold text-sm text-gray-900 truncate">
                  {profile.city ? `${profile.address}, ${profile.city}` : 'Not provided'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100">
              <div className="p-2 rounded-full bg-orange-500">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">Member Since</p>
                <p className="font-semibold text-sm text-gray-900">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About & Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profile.bio && (
          <Card className="shadow border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-blue-700">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
            </CardContent>
          </Card>
        )}
        {profile.skills && (
          <Card className="shadow border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-blue-700">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{profile.skills}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Subscription Status */}
      <Card className="shadow border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            {isPro ? <Crown className="w-5 h-5 text-yellow-500" /> : <Star className="w-5 h-5" />}
            <span>Subscription</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-700">{tasksRemaining}</p>
              <p className="text-xs text-gray-500">Tasks Remaining</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{isPro ? '10km' : '2km'}</p>
              <p className="text-xs text-gray-500">Visibility Radius</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{isPro ? 'High' : 'Normal'}</p>
              <p className="text-xs text-gray-500">Priority Level</p>
            </div>
          </div>
          {!isPro && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-sm mb-2">Upgrade to Pro</h4>
              <p className="text-sm text-gray-600 mb-3">
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
      <ReviewsDisplay userId={user.id} className="mt-6" />
    </div>
  );
};

export default ProfileDisplay;
