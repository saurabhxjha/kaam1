import React, { useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import SignatureBackground from "@/components/jodkaam/SignatureBackground";
// import Navbar from "@/components/jodkaam/Navbar";
import Hero from "@/components/jodkaam/Hero";
import TrustElements from "@/components/jodkaam/TrustElements";
import Features from "@/components/jodkaam/Features";
import SimplifiedPricing from "@/components/jodkaam/SimplePricing";
import CallToAction from "@/components/jodkaam/CallToAction";
import Footer from "@/components/jodkaam/Footer";

const Index: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    
    if (paymentStatus === 'success') {
      toast({
        title: "Payment Successful! 🎉",
        description: "Welcome to JodKaam Pro! Your subscription is now active.",
      });
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try again anytime.",
        variant: "destructive",
      });
    }
  }, [searchParams]);

  useEffect(() => {
    // Handle scroll to pricing or features section from navigation state
    if (location.state?.scrollTo === 'pricing') {
      setTimeout(() => {
        const pricingElement = document.getElementById('pricing');
        if (pricingElement) {
          pricingElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (location.state?.scrollTo === 'features') {
      setTimeout(() => {
        const featuresElement = document.getElementById('features');
        if (featuresElement) {
          featuresElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.state]);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is JodKaam?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "JodKaam is a hyperlocal platform to post small tasks and find nearby gig workers to complete them quickly.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a free plan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can start free with up to 3 task posts per month, secure chat, and local visibility.",
        },
      },
      {
        "@type": "Question",
        name: "What do I get with Pro?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pro unlocks unlimited task posting and wider visibility up to 10 km, helping you connect faster.",
        },
      },
    ],
  };

  return (
    <SignatureBackground>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <Hero />
          <TrustElements />
          <div id="features">
            <Features />
          </div>
          <div id="pricing">
            <SimplifiedPricing />
          </div>
          <CallToAction />
        </main>
        <Footer />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </SignatureBackground>
  );
};

export default Index;
