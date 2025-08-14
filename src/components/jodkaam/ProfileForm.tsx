import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, MapPin, Phone, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

interface ProfileFormProps {
  user: any;
  onProfileComplete: () => void;
  isEdit?: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user, onProfileComplete, isEdit = false }) => {
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    bio: "",
    skills: "",
  });

  // Load existing profile data if in edit mode
  useEffect(() => {
    if (isEdit && user) {
      loadExistingProfile();
    }
  }, [isEdit, user]);

  const loadExistingProfile = async () => {
    try {
      // Try to get profile from Supabase first
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setFormData({
          firstName: profileData.first_name || "",
          lastName: profileData.last_name || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          city: profileData.city || "",
          bio: profileData.bio || "",
          skills: profileData.skills || "",
        });
        setProfileImage(profileData.profile_image || "");
      } else {
        // Fallback to localStorage
        const profileKey = `profile_${user.id}`;
        const storedProfile = localStorage.getItem(profileKey);
        
        if (storedProfile) {
          const data = JSON.parse(storedProfile);
          setFormData({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
            bio: data.bio || "",
            skills: data.skills || "",
          });
          setProfileImage(data.profile_image || "");
        }
      }
    } catch (error) {
      console.error('Error loading existing profile:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in your name and phone number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const profileData: Database['public']['Tables']['user_profiles']['Insert'] = {
        user_id: user.id,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        bio: formData.bio.trim() || null,
        skills: formData.skills.trim() || null,
        profile_image: profileImage || null,
        profile_completed: true,
        subscription_type: 'free',
        tasks_posted_this_month: 0,
      };

      let dbError = null;

      if (isEdit) {
        // Update existing profile
        const { error } = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('user_id', user.id);
        dbError = error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('user_profiles')
          .insert(profileData);
        dbError = error;
      }

      if (dbError) {
        console.error('Database error:', dbError);
        toast({
          title: "Database Error",
          description: "Saving to database failed, but your profile is saved locally.",
          variant: "destructive",
        });
      }

      // Always save to localStorage as backup/fallback
      const localProfileData = {
        ...profileData,
        created_at: isEdit ? 
          (JSON.parse(localStorage.getItem(`profile_${user.id}`) || '{}').created_at || new Date().toISOString()) : 
          new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(localProfileData));

      toast({
        title: isEdit ? "Profile Updated! ✅" : "Profile Created! ✅",
        description: isEdit ? "Your profile has been updated successfully." : "Your profile has been set up successfully.",
      });

      // Small delay to ensure data is saved
      setTimeout(() => {
        onProfileComplete();
      }, 100);
      
    } catch (error) {
      console.error('Profile creation/update error:', error);
      toast({
        title: "Profile Error",
        description: error instanceof Error ? error.message : "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isEdit ? "Edit Your Profile" : "Complete Your Profile"}
          </CardTitle>
          <p className="text-muted-foreground">
            {isEdit 
              ? "Update your JodKaam profile information" 
              : "Let's set up your JodKaam profile to get started"
            }
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profileImage} />
                  <AvatarFallback className="text-lg">
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90">
                  <Camera className="w-4 h-4" />
                </label>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              <p className="text-sm text-muted-foreground">Upload your profile picture</p>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  className="pl-10"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="Street address"
                    className="pl-10"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Your city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={3}
              />
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Textarea
                id="skills"
                placeholder="List your skills (e.g., plumbing, cleaning, tutoring...)"
                value={formData.skills}
                onChange={(e) => handleInputChange('skills', e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading 
                ? (isEdit ? "Updating Profile..." : "Creating Profile...") 
                : (isEdit ? "Update Profile" : "Complete Profile")
              }
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ProfileForm;
