

import React from "react";
import { FaTwitter, FaFacebookF, FaInstagram } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
  <footer className="bg-gray-50 border-t border-gray-100 w-full">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Brand & About */}
        <div className="col-span-1 flex flex-col gap-2">
          <span className="text-2xl font-extrabold text-blue-700">JodKaam</span>
          <p className="text-gray-500 text-sm">Connect work, locally. JodKaam is your hyperlocal platform for finding and posting gigs with trust and speed.</p>
        </div>
        {/* Quick Links */}
        <div className="col-span-1">
          <h4 className="text-lg font-semibold mb-2 text-gray-900">Quick Links</h4>
          <ul className="space-y-1 text-gray-600 text-sm">
            <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
            <li><a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a></li>
            <li><a href="/auth" className="hover:text-blue-600 transition-colors">Get Started</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
        {/* Contact */}
        <div className="col-span-1">
          <h4 className="text-lg font-semibold mb-2 text-gray-900">Contact</h4>
          <ul className="space-y-1 text-gray-600 text-sm">
            <li>Email: <a href="mailto:support@jodkaam.com" className="hover:text-blue-600">support@jodkaam.com</a></li>
            <li>Phone: <a href="tel:+919999999999" className="hover:text-blue-600">+91 99999 99999</a></li>
            <li>Location: India</li>
          </ul>
        </div>
        {/* Social */}
        <div className="col-span-1">
          <h4 className="text-lg font-semibold mb-2 text-gray-900">Follow Us</h4>
          <div className="flex gap-4 mt-1">
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors" aria-label="Twitter">
              <FaTwitter className="w-6 h-6" />
            </a>
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors" aria-label="Facebook">
              <FaFacebookF className="w-6 h-6" />
            </a>
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors" aria-label="Instagram">
              <FaInstagram className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 pt-3 pb-1 text-center text-gray-400 text-xs">
        © {new Date().getFullYear()} JodKaam. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
