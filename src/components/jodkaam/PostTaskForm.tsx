import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, DollarSign, Clock, Tag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
interface TaskFormData {
  title: string;
  description: string;
  category: string;
  budgetMin: string;
  budgetMax: string;
  urgency: string;
  locationAddress: string;
  locationLat: number;
  locationLng: number;
}

const PostTaskForm: React.FC<{ onClose?: () => void; onTaskPosted?: () => void }> = ({ 
  onClose, 
  onTaskPosted 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    category: "other",
    budgetMin: "",
    budgetMax: "",
    urgency: "normal",
    locationAddress: "",
    locationLat: 28.6139, // Default Delhi coordinates
    locationLng: 77.2090,
  });

  const categories = [
    { value: "other", label: "Other" },
    { value: "home", label: "Home & Repair" },
    { value: "delivery", label: "Delivery & Transport" },
    { value: "cleaning", label: "Cleaning" },
    { value: "tech", label: "Tech Support" },
    { value: "care", label: "Pet & Child Care" },
    { value: "events", label: "Events & Photography" },
  ];

  const urgencyLevels = [
    { value: "low", label: "Low Priority" },
    { value: "normal", label: "Normal" },
    { value: "high", label: "High Priority" },
    { value: "urgent", label: "Urgent" },
  ];

  const handleInputChange = (field: keyof TaskFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            locationLat: position.coords.latitude,
            locationLng: position.coords.longitude,
          }));
          toast({
            title: "Location captured",
            description: "Your current location has been set for the task.",
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Could not get your location. Please enter address manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
    }
  };

  const checkSubscriptionLimits = async () => {
    if (!user) return false;

    try {
      // Check user's profile and subscription
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('subscription_type, tasks_posted_this_month')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error checking profile:', profileError);
        return true; // Allow posting if check fails
      }

      const isPro = profile?.subscription_type === 'pro';
      const currentTaskCount = profile?.tasks_posted_this_month || 0;

      // Free users have task limits
      if (!isPro && currentTaskCount >= 3) {
        toast({
          title: "Task Limit Reached",
          description: "Free users can only post 3 tasks per month. Upgrade to Pro for unlimited tasks!",
          variant: "destructive",
        });
        return false;
      }

      if (!isPro) {
        toast({
          title: "Free Plan",
          description: `You have ${3 - currentTaskCount} tasks remaining this month. Upgrade to Pro for unlimited tasks!`,
        });
      }

      return true;
    } catch (error) {
      console.error('Error checking subscription limits:', error);
      return true; // Allow posting if check fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to post a task.",
        variant: "destructive",
      });
      return;
    }

    // Check subscription limits
    const canPost = await checkSubscriptionLimits();
    if (!canPost) return;

    setLoading(true);

    try {
      // First ensure user has a profile entry in profiles table
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create profile entry if it doesn't exist
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            subscription_tier: 'free',
            is_pro: false
          });
          
        if (profileError) {
          console.log('Profile creation warning:', profileError);
          // Continue anyway - might be duplicate key error
        }
      }

      // Validate form - only essential fields
      if (!formData.title.trim()) {
        throw new Error("Please enter a task title");
      }
      
      if (!formData.description.trim()) {
        throw new Error("Please enter a task description");
      }

      if (!formData.locationLat || !formData.locationLng) {
        // Set default coordinates for Delhi if no location provided
        formData.locationLat = 28.6139;
        formData.locationLng = 77.2090;
      }

      // Get user subscription to determine visibility radius
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('subscription_type')
        .eq('user_id', user.id)
        .single();

      const isPro = profile?.subscription_type === 'pro';
      const visibilityRadius = isPro ? 10000 : 2000; // 10km for pro, 2km for free

      // Create task data for Supabase
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category || 'other',
        budget_min: formData.budgetMin ? parseInt(formData.budgetMin) : null,
        budget_max: formData.budgetMax ? parseInt(formData.budgetMax) : null,
        urgency: formData.urgency || 'normal',
        location_address: formData.locationAddress.trim() || "Delhi, India",
        location_lat: formData.locationLat,
        location_lng: formData.locationLng,
        visibility_radius: isPro ? 10000 : 2000,
        client_id: user.id, // Direct user ID without type assertion
        status: 'open',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      // Save task to Supabase
      console.log('Attempting to save task:', taskData);
      
      const { data: savedTask, error: taskError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (taskError) {
        console.error('Task save error details:', {
          error: taskError,
          code: taskError.code,
          message: taskError.message,
          details: taskError.details,
          hint: taskError.hint
        });
        throw new Error(`Failed to save task: ${taskError.message || 'Database error'}`);
      }

      // Get current profile to update task count properly
      const { data: currentProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('tasks_posted_this_month')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.warn('Profile fetch error:', profileError);
      }

      // Update user's task count
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          tasks_posted_this_month: (currentProfile?.tasks_posted_this_month || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.warn('Task count update error:', updateError);
        // Don't fail the whole operation for count update
      }

      toast({
        title: "Task Posted Successfully!",
        description: `Your task "${formData.title}" is now live and visible to nearby workers.`,
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "other",
        budgetMin: "",
        budgetMax: "",
        urgency: "normal",
        locationAddress: "",
        locationLat: 28.6139,
        locationLng: 77.2090,
      });

      onTaskPosted?.();
      onClose?.();
    } catch (error) {
      console.error('Error posting task:', error);
      toast({
        title: "Failed to Post Task",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="w-full max-w-2xl mx-auto bg-white shadow-lg border border-gray-200 rounded-xl p-4 sm:p-6">
    <div className="flex items-center gap-2 mb-4 sm:mb-6">
      <Tag className="h-5 w-5 text-blue-600" />
      <span className="text-lg sm:text-xl font-semibold text-gray-900">Post a New Task</span>
    </div>
  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="e.g., Need help moving furniture"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
          </div>
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your task in detail..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
            />
          </div>

          {/* Category and Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency</Label>
              <Select value={formData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label>Budget (₹)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budgetMin" className="text-sm text-muted-foreground">Minimum</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  placeholder="100"
                  value={formData.budgetMin}
                  onChange={(e) => handleInputChange("budgetMin", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="budgetMax" className="text-sm text-muted-foreground">Maximum</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  placeholder="500"
                  value={formData.budgetMax}
                  onChange={(e) => handleInputChange("budgetMax", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                placeholder="Enter address or use current location"
                value={formData.locationAddress}
                onChange={(e) => handleInputChange("locationAddress", e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={getCurrentLocation}>
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
            {formData.locationLat && formData.locationLng && (
              <p className="text-sm text-muted-foreground">
                Location set: {formData.locationLat.toFixed(4)}, {formData.locationLng.toFixed(4)}
              </p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1 h-12 font-semibold bg-gradient-primary hover:bg-blue-700 transition-all duration-300 shadow-lg"
            >
              <Tag className="h-4 w-4 mr-2" />
              {loading ? "Posting..." : "Post Task"}
            </Button>
            {onClose && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="h-12 px-6 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
            )}
          </div>
    </form>
  </div>
  );
};

export default PostTaskForm;
