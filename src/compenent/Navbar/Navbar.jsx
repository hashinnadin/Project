import React from "react";
import { logo } from "../../assets";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart } from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="w-full bg-[#0d1b2a] flex items-center justify-between px-6 py-4 shadow-lg">

      {/* Left: Logo */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate("/home")}
      >
        <img src={logo} className="w-14 h-14 rounded-full" alt="logo" />
      </div>

      {/* CENTER MENU */}
      <ul className="hidden md:flex items-center justify-center gap-10 text-white text-lg flex-1">
        <li
          className="hover:text-blue-400 cursor-pointer"
          onClick={() => navigate("/home")}
        >
          Home
        </li>

        <li
          className="hover:text-blue-400 cursor-pointer"
          onClick={() => navigate("/products")}
        >
          Special Cakes
        </li>

        {/* Search */}
        <li className="hover:text-blue-400 cursor-pointer flex items-center gap-2">
          <FaSearch className="text-xl" />
          Search
        </li>

        {/* Cart */}
        <li className="hover:text-blue-400 cursor-pointer flex items-center gap-2">
          <FaShoppingCart className="text-xl" />
          Cart
        </li>
      </ul>

      {/* RIGHT: Register & Login */}
      <div className="hidden md:flex items-center gap-6 text-white text-lg">

        <button
          onClick={() => navigate("/")}
          className="hover:text-blue-400"
        >
          Register
        </button>

        <button
          onClick={() => navigate("/login")}
          className="hover:text-blue-400"
        >
          Login
        </button>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden text-white text-3xl">☰</div>
    </nav>
  );
}

export default Navbar;
