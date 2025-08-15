import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CallToAction: React.FC = () => {
  const navigate = useNavigate();
  return (
  <section className="pt-16 md:pt-28 pb-4 md:pb-6 bg-white flex items-center justify-center border-b border-gray-100">
      <div className="max-w-2xl mx-auto text-center flex flex-col items-center p-10 md:p-16 bg-gray-50 rounded-2xl shadow-md">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">Ready to get started?</h2>
        <p className="mb-10 text-xl md:text-2xl font-medium text-gray-700">Join thousands of users finding and posting gigs every day on JodKaam.</p>
        <Button size="xl" className="text-xl px-10 py-5 font-bold shadow-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 rounded-full" onClick={() => navigate('/auth')}>
          Get Started Now
        </Button>
      </div>
    </section>
  );
};

export default CallToAction;
