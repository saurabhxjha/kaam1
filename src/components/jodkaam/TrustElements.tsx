import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, CheckCircle, Clock, TrendingUp } from "lucide-react";

const TrustElements: React.FC = () => {
  const stats = [
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      value: "10,000+",
      label: "Active Users",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      value: "25,000+",
      label: "Tasks Completed",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: <Star className="h-6 w-6 text-yellow-600" />,
      value: "4.8/5",
      label: "Average Rating",
      gradient: "from-yellow-500 to-yellow-600"
    },
    {
      icon: <Clock className="h-6 w-6 text-purple-600" />,
      value: "< 2 hrs",
      label: "Average Response",
      gradient: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold text-sm shadow-soft mb-4">
            <TrendingUp className="w-4 h-4" />
            Trusted by thousands across India
          </div>
          <h3 className="text-2xl font-bold text-gradient-primary">Growing Every Day</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-0 surface-card hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1 group">
              <CardContent className="pt-6 pb-6">
                <div className="flex justify-center mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300`}>
                    {React.cloneElement(stat.icon, { className: "h-6 w-6 text-white" })}
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gradient-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustElements;
