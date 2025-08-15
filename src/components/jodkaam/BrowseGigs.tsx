import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Filter, MapPin, Plus, Map } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import TaskCard from "./TaskCard";
import PostTaskForm from "./PostTaskForm";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetMin?: number;
  budgetMax?: number;
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  locationAddress: string;
  distance?: number;
  clientName: string;
  clientRating: number;
  createdAt: string;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
}

const BrowseGigs: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "home", label: "Home & Repair" },
    { value: "delivery", label: "Delivery & Transport" },
    { value: "cleaning", label: "Cleaning" },
    { value: "tech", label: "Tech Support" },
    { value: "care", label: "Pet & Child Care" },
    { value: "events", label: "Events & Photography" },
    { value: "other", label: "Other" },
  ];

  const urgencyLevels = [
    { value: "all", label: "All Urgency Levels" },
    { value: "urgent", label: "Urgent" },
    { value: "high", label: "High Priority" },
    { value: "normal", label: "Normal" },
    { value: "low", label: "Low Priority" },
  ];

  useEffect(() => {
    // Get user location
    getCurrentLocation();
    // Load tasks
    loadTasks();
  }, []);

  useEffect(() => {
    // Filter tasks based on search and filters
    let filtered = tasks;

    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.locationAddress.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(task => task.category === selectedCategory);
    }

    if (selectedUrgency !== "all") {
      filtered = filtered.filter(task => task.urgency === selectedUrgency);
    }

    // Sort by distance (closest first), then by urgency, then by date
    filtered.sort((a, b) => {
      if (a.distance && b.distance) {
        if (a.distance !== b.distance) return a.distance - b.distance;
      }
      
      const urgencyOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      const aUrgency = urgencyOrder[a.urgency] ?? 2;
      const bUrgency = urgencyOrder[b.urgency] ?? 2;
      if (aUrgency !== bUrgency) return aUrgency - bUrgency;
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, selectedCategory, selectedUrgency]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to Delhi coordinates
          setUserLocation({
            lat: 28.6139,
            lng: 77.2090,
          });
        }
      );
    } else {
      // Default to Delhi coordinates
      setUserLocation({
        lat: 28.6139,
        lng: 77.2090,
      });
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      // Load tasks from Supabase
      const { data: supabaseTasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to load tasks: ${error.message}`);
      }

      // Convert Supabase tasks to the expected format
      const convertedTasks = (supabaseTasks || []).map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        budgetMin: task.budget_min,
        budgetMax: task.budget_max,
        urgency: task.urgency,
        locationAddress: task.location_address,
        client_id: task.client_id, // Add client_id for notifications
        distance: task.location_lat && task.location_lng && userLocation 
          ? calculateDistance(userLocation.lat, userLocation.lng, task.location_lat, task.location_lng)
          : Math.floor(Math.random() * 3000) + 500,
        clientName: 'Client', // We can fetch this from user_profiles if needed
        clientRating: 4.5,
        createdAt: task.created_at,
        status: task.status
      }));

      // Show only real tasks
      setTasks(convertedTasks);
      
      toast({
        title: "Tasks Loaded",
        description: `Found ${convertedTasks.length} tasks in the area.`,
      });
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: "Error Loading Tasks",
        description: "Failed to load nearby tasks.",
        variant: "destructive",
      });
      // Set empty array on error
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleBid = (taskId: string) => {
    // Refresh tasks or update the specific task
    console.log(`Bid submitted for task ${taskId}`);
  };

  const handleTaskPosted = () => {
    // Refresh the tasks list
    loadTasks();
  };

  return (
  <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 space-y-4 md:space-y-6">
  {/* Header */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1 sm:px-0">
        <div>
          <h1 className="text-3xl font-bold">Browse Nearby Gigs</h1>
          <p className="text-muted-foreground">
            Find tasks in your area and start earning today
          </p>
        </div>
        
        <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post a Task
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-2xl w-full p-0 bg-transparent border-none shadow-none"
            style={{
              maxHeight: '80vh',
              height: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              overflow: 'visible',
            }}
          >
            <div
              className="w-full flex justify-center items-start"
              style={{
                width: '100%',
                maxWidth: 600,
                height: '100%',
                maxHeight: '80vh',
                minHeight: 0,
                padding: 0,
                margin: 0,
                overflowY: 'auto',
                borderRadius: 16,
                background: 'white',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              }}
            >
              <PostTaskForm 
                onClose={() => setShowPostDialog(false)}
                onTaskPosted={handleTaskPosted}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Urgency Filter */}
            <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
              <SelectTrigger>
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                {urgencyLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {userLocation ? "Current location" : "Loading location..."}
              </span>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchQuery}
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {categories.find(c => c.value === selectedCategory)?.label}
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedUrgency !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {urgencyLevels.find(u => u.value === selectedUrgency)?.label}
                <button
                  onClick={() => setSelectedUrgency("all")}
                  className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onBid={handleBid}
              showBidButton={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12 px-2">
          <Map className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedCategory !== "all" || selectedUrgency !== "all"
              ? "Try adjusting your search filters or check back later."
              : "No tasks available in your area right now. Check back later or post your own task!"}
          </p>
          <Button onClick={() => setShowPostDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Post the First Task
          </Button>
        </div>
      )}
    </div>
  );
};

export default BrowseGigs;
