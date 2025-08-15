import React from "react";

const testimonials = [
  {
    name: "Amit S.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    quote: "JodKaam made it super easy to find help for my home repairs. Highly recommended!",
    rating: 5
  },
  {
    name: "Priya R.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    quote: "I posted a gig and got responses within minutes. The platform is secure and reliable.",
    rating: 5
  },
  {
    name: "Rahul K.",
    avatar: "https://randomuser.me/api/portraits/men/65.jpg",
    quote: "The Pro plan is totally worth it. Unlimited tasks and great support!",
    rating: 5
  }
];

const TrustElements: React.FC = () => (
  <section className="py-16 md:py-28 bg-white border-b border-gray-100">
    <div className="max-w-4xl mx-auto text-center mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold text-sm mb-4 shadow-sm">
        <span className="inline-block w-4 h-4 bg-green-500 rounded-full mr-2"></span>
        Verified & Secure
      </div>
      <h3 className="text-3xl md:text-4xl font-extrabold mb-2 text-gray-900">Trusted by 10,000+ users</h3>
      <div className="flex justify-center gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="text-yellow-400 text-2xl">★</span>
        ))}
        <span className="ml-2 text-gray-600 text-base">5.0/5.0 (1,200+ ratings)</span>
      </div>
    </div>
    <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
      {testimonials.map((t, i) => (
        <div key={i} className="bg-gray-50 rounded-2xl shadow-md p-8 flex-1 flex flex-col items-center max-w-xs mx-auto border border-gray-100">
          <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full mb-4 border-2 border-blue-200 shadow" />
          <p className="italic text-gray-700 mb-3 text-lg">“{t.quote}”</p>
          <div className="flex gap-1 mb-2">
            {Array.from({ length: t.rating }).map((_, i) => (
              <span key={i} className="text-yellow-400 text-lg">★</span>
            ))}
          </div>
          <span className="text-base font-semibold text-gray-800">{t.name}</span>
        </div>
      ))}
    </div>
  </section>
);

export default TrustElements;
