

import React from "react";
import { FaTwitter, FaFacebookF, FaInstagram } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
  <footer className="bg-gradient-to-br from-gray-900 to-blue-900 text-white w-full">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-start">
        {/* Brand & About */}
        <div className="col-span-1 sm:col-span-2 md:col-span-1 flex flex-col gap-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-white">Sahayuk</span>
          <p className="text-gray-300 text-sm leading-relaxed">Milkar Kaam, Saath Mein Naam. Your trusted hyperlocal platform for finding and posting gigs with security and speed.</p>
        </div>
        {/* Quick Links */}
        <div className="col-span-1">
          <h4 className="text-lg font-semibold mb-3 text-white">Quick Links</h4>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li><a href="#features" className="hover:text-blue-300 transition-colors">Features</a></li>
            <li><a href="#pricing" className="hover:text-blue-300 transition-colors">Pricing</a></li>
            <li><a href="/auth" className="hover:text-blue-300 transition-colors">Get Started</a></li>
            <li><a href="#" className="hover:text-blue-300 transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
        {/* Contact */}
        <div className="col-span-1">
          <h4 className="text-lg font-semibold mb-3 text-white">Contact</h4>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>Email: <a href="mailto:support@sahayuk.com" className="hover:text-blue-300 transition-colors">support@sahayuk.com</a></li>
            <li>Phone: <a href="tel:+919999999999" className="hover:text-blue-300 transition-colors">+91 99999 99999</a></li>
            <li>Location: India</li>
          </ul>
        </div>
        {/* Social */}
        <div className="col-span-1">
          <h4 className="text-lg font-semibold mb-3 text-white">Follow Us</h4>
          <div className="flex gap-4 mt-2">
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400 transition-colors transform hover:scale-110" aria-label="Twitter">
              <FaTwitter className="w-6 h-6" />
            </a>
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-500 transition-colors transform hover:scale-110" aria-label="Facebook">
              <FaFacebookF className="w-6 h-6" />
            </a>
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-pink-400 transition-colors transform hover:scale-110" aria-label="Instagram">
              <FaInstagram className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-700 pt-4 pb-4 text-center text-gray-400 text-xs">
        © {new Date().getFullYear()} Sahayuk. All rights reserved. Made with ❤️ in India.
      </div>
    </footer>
  );
};

export default Footer;
