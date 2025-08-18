import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, MessageSquare, Bell, Shield, Zap, Users, Star, Clock } from "lucide-react";

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  actionButton?: React.ReactNode;
}> = ({ icon, title, description, actionButton }) => (
  <Card className="bg-white rounded-2xl shadow-lg border-0 transition-transform duration-200 hover:-translate-y-1">
    <CardHeader>
      <CardTitle className="flex items-center gap-3 text-xl">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="text-muted-foreground">
      {description}
      {actionButton && <div className="mt-4">{actionButton}</div>}
    </CardContent>
  </Card>
);

const Features: React.FC = () => {
  const features = [
    {
      icon: <MapPin className="h-8 w-8 text-blue-600" />,
      title: "Hyperlocal Matching",
      description: "Find tasks and workers within your neighborhood for quick, convenient connections.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-green-600" />,
      title: "Secure Chat",
      description: "Built-in messaging system to discuss task details safely before starting work.",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: <Bell className="h-8 w-8 text-purple-600" />,
      title: "Instant Notifications",
      description: "Get notified immediately when someone bids on your task or accepts your offer.",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Trust & Safety",
      description: "Rating system and verified profiles ensure safe, reliable task completion.",
      gradient: "from-red-500 to-red-600"
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Quick Turnaround",
      description: "Most tasks get completed within 24 hours with our efficient matching system.",
      gradient: "from-yellow-500 to-yellow-600"
    },
    {
      icon: <Users className="h-8 w-8 text-indigo-600" />,
      title: "Community Driven",
      description: "Join a growing community of trusted local workers and task posters.",
      gradient: "from-indigo-500 to-indigo-600"
    },
    {
      icon: <Star className="h-8 w-8 text-pink-600" />,
      title: "Quality Assured",
      description: "Every completed task is reviewed and rated to maintain high standards.",
      gradient: "from-pink-500 to-pink-600"
    },
    {
      icon: <Clock className="h-8 w-8 text-teal-600" />,
      title: "24/7 Available",
      description: "Post and browse tasks anytime, with workers available around the clock.",
      gradient: "from-teal-500 to-teal-600"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-primary mb-4">
            Why Choose Sahayuk?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built for the modern gig economy with features that make local task management simple and secure.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="text-center border-0 surface-card hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6 pt-4 sm:pt-6">
                <div className="flex justify-center mb-2 sm:mb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300`}>
                    {React.cloneElement(feature.icon, { className: "h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" })}
                  </div>
                </div>
                <CardTitle className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold group-hover:text-primary transition-colors duration-300 leading-tight">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
                <CardDescription className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
