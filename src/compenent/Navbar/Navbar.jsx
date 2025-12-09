import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaSignOutAlt, FaUser, FaHome, FaBox } from "react-icons/fa";
import { HiSearch, HiMenu, HiX } from "react-icons/hi";
import { toast } from "react-toastify";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);

    const updateCounts = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const cartTotal = cart.reduce((total, item) => total + (item.quantity || 1), 0);

      setCartCount(cartTotal);
      setWishlistCount(wishlist.length);
    };

    updateCounts();

    window.addEventListener("updateCart", updateCounts);
    window.addEventListener("updateWishlist", updateCounts);

    return () => {
      window.removeEventListener("updateCart", updateCounts);
      window.removeEventListener("updateWishlist", updateCounts);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    localStorage.removeItem("wishlist");

    setUser(null);
    setCartCount(0);
    setWishlistCount(0);

    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${searchTerm}`);
      setSearchTerm("");
      setIsSearchActive(false);
    }
  };

  const handleCartClick = () => {
    if (!user) {
      toast.error("Please login to view your cart");
      navigate("/login");
    } else {
      navigate("/cart");
    }
  };

  const handleWishlistClick = () => {
    if (!user) {
      toast.error("Please login to view your wishlist");
      navigate("/login");
    } else {
      navigate("/wishlist");
    }
  };

  const handleOrdersClick = () => {
    if (!user) {
      toast.error("Please login to view orders");
      navigate("/login");
    } else {
      navigate("/orders");
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home", icon: <FaHome /> },
    { path: "/products", label: "All Cakes", icon: <FaBox /> },
    { path: "/orders", label: "My Orders", icon: <FaBox />, onClick: handleOrdersClick }
  ];

  return (
    <nav className="w-full bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 shadow-md border-b border-rose-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        
        <div className="flex items-center justify-between py-4">

          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => navigate("/")}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl 
              flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <img src={logo} className="w-10 h-10 rounded-lg object-cover" alt="BakeHub Logo" />
            </div>
            <span className="text-2xl font-bold text-slate-800 hidden sm:block">
              Bake<span className="text-rose-500">Hub</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <ul className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <li key={link.path}>
                <button
                  onClick={link.onClick || (() => navigate(link.path))}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                    isActive(link.path)
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200"
                      : "text-slate-700 hover:text-rose-600 hover:bg-rose-50"
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for cakes, flavors..."
                className="w-full px-5 py-2.5 bg-white border-2 border-rose-100 rounded-full 
                text-slate-800 placeholder-rose-300 focus:outline-none focus:border-rose-400 
                focus:ring-2 focus:ring-rose-200 transition-all duration-300 shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-600 transition-colors"
              >
                <HiSearch size={20} />
              </button>
            </form>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-4">
            
            {/* Search Button - Mobile */}
            <button
              onClick={() => setIsSearchActive(!isSearchActive)}
              className="lg:hidden text-slate-600 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <HiSearch size={22} />
            </button>

            {/* Wishlist */}
            <div className="relative group">
              <button
                onClick={handleWishlistClick}
                className="text-slate-600 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-all duration-300 group"
              >
                <FaHeart size={20} />
              </button>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 
                  text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center 
                  shadow-lg shadow-rose-300">
                  {wishlistCount}
                </span>
              )}
              <div className="absolute right-0 top-full mt-2 px-2 py-1 bg-rose-500 text-xs text-white 
                rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Wishlist
              </div>
            </div>

            {/* Cart */}
            <div className="relative group">
              <button
                onClick={handleCartClick}
                className="text-slate-600 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-all duration-300 group"
              >
                <FaShoppingCart size={20} />
              </button>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-500 
                  text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center 
                  shadow-lg shadow-emerald-300">
                  {cartCount}
                </span>
              )}
              <div className="absolute right-0 top-full mt-2 px-2 py-1 bg-rose-500 text-xs text-white 
                rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Cart
              </div>
            </div>

            {/* User Actions */}
            {user ? (
              <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-rose-100 shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full 
                    flex items-center justify-center">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <span className="text-slate-800 font-medium">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 
                  text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all duration-300 
                  hover:shadow-lg shadow-rose-200"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="hidden lg:flex bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 
                text-white px-6 py-2.5 rounded-lg font-medium items-center gap-2 transition-all duration-300 
                hover:shadow-lg shadow-emerald-200"
              >
                <FaUser />
                <span>Login</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-slate-600 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <HiX size={26} /> : <HiMenu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchActive && (
          <div className="lg:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for cakes, flavors..."
                className="w-full px-5 py-3 bg-white border-2 border-rose-100 rounded-full 
                text-slate-800 placeholder-rose-300 focus:outline-none focus:border-rose-400 
                focus:ring-2 focus:ring-rose-200 transition-all duration-300 shadow-sm"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-600 transition-colors"
              >
                <HiSearch size={20} />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white rounded-xl mt-2 mb-4 p-4 shadow-lg border border-rose-100">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    if (link.onClick) link.onClick();
                    else navigate(link.path);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm"
                      : "text-slate-700 hover:bg-rose-50 hover:text-rose-600"
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  {link.label}
                </button>
              ))}

              <div className="border-t border-rose-100 pt-4 mt-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 rounded-lg mb-3 border border-rose-100">
                      <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full 
                        flex items-center justify-center">
                        <FaUser className="text-white text-sm" />
                      </div>
                      <div>
                        <p className="text-slate-800 font-medium">{user.username}</p>
                        <p className="text-rose-500 text-sm">Welcome back!</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 
                      text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm"
                    >
                      <FaSignOutAlt />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 
                    text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FaUser />
                    Login / Register
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;