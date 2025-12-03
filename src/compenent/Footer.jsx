import React from "react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-[#0d1b2a] text-gray-300 pt-10 pb-6 mt-10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Logo + About */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">SweetMart</h2>
          <p className="text-gray-400">
            Fresh cakes, delightful sweets, and delicious flavors delivered to your doorstep.
          </p>

          {/* Social Icons */}
          <div className="flex gap-4 mt-4 text-xl">
            <FaFacebook className="hover:text-white cursor-pointer"/>
            <FaInstagram className="hover:text-white cursor-pointer" />
            <FaTwitter className="hover:text-white cursor-pointer" />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li className="hover:text-white cursor-pointer">Home</li>
            <li className="hover:text-white cursor-pointer">Products</li>
            <li className="hover:text-white cursor-pointer">Offers</li>
            <li className="hover:text-white cursor-pointer">Contact Us</li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Help & Support</h3>
          <ul className="space-y-2">
            <li className="hover:text-white cursor-pointer">FAQs</li>
            <li className="hover:text-white cursor-pointer">Shipping Info</li>
            <li className="hover:text-white cursor-pointer">Return Policy</li>
            <li className="hover:text-white cursor-pointer">Terms & Conditions</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Contact Us</h3>
          <p className="text-gray-400"> Malappuram, Kerala</p>
          <p className="text-gray-400"> +91 98765 43210</p>
          <p className="text-gray-400">support@sweetmart.com</p>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="text-center text-gray-500 mt-10 border-t border-gray-700 pt-4">
        © {new Date().getFullYear()} SweetMart. All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;
