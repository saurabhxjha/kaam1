import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CallToAction: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20"></div>
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-6">
          <Sparkles className="w-16 h-16 mx-auto text-yellow-300 mb-4" />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Ready to Transform Your 
          <span className="block text-yellow-300">Local Work Experience?</span>
        </h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join thousands of users who are already connecting work locally with Sahayuk. Start earning or get help today!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Button 
            size="lg" 
            className="font-semibold px-8 py-4 h-14 bg-white text-blue-600 hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            onClick={() => window.location.href = '/auth'}
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Get Started Free
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="font-semibold px-8 py-4 h-14 text-white border-2 border-white hover:bg-gray-100 hover:text-blue-600 transition-all duration-300"
            onClick={() => window.location.href = '/browse'}
          >
            Browse Tasks
          </Button>
        </div>
        <p className="text-sm text-blue-200 mt-6">
          No credit card required • Start with 3 free task posts
        </p>
      </div>
    </section>
  );
};

export default CallToAction;
