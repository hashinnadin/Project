import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaHeart, FaSignOutAlt, FaList } from "react-icons/fa";
import { toast } from "react-toastify";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);

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

  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        
        <div className="flex items-center justify-between py-4">

          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src={logo} className="w-12 h-12 rounded-full" />
            <span className="text-2xl font-bold text-amber-800 hidden sm:block">BakeHub</span>
          </div>

          <ul className="hidden lg:flex items-center gap-8 text-gray-700 text-lg">

            <li
              className={`cursor-pointer hover:text-amber-600 ${
                isActive("/") ? "text-amber-600 font-semibold" : ""
              }`}
              onClick={() => navigate("/")}>
              Home
            </li>

            <li
              className={`cursor-pointer hover:text-amber-600 ${
                isActive("/products") ? "text-amber-600 font-semibold" : ""
              }`}
              onClick={() => navigate("/products")}>
              All Cakes
            </li>

            {/* NEW – Orders */}
            <li
              className={`cursor-pointer hover:text-amber-600 ${
                isActive("/orders") ? "text-amber-600 font-semibold" : ""
              }`}
              onClick={handleOrdersClick}>
              My Orders
            </li>

          </ul>

          <div className="flex items-center gap-6">
            
            <div
              className="relative cursor-pointer flex items-center gap-2 text-gray-600 hover:text-amber-600"
              onClick={handleWishlistClick}>
              <FaHeart />
              <span className="hidden sm:block text-sm">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </div>

            <div
              className="relative cursor-pointer flex items-center gap-2 text-gray-600 hover:text-amber-600"
              onClick={handleCartClick}>
              <FaShoppingCart />
              <span className="hidden sm:block text-sm">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <span className="hidden md:block text-gray-700 font-medium">Hi, {user.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <FaSignOutAlt />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium">
                Login
              </button>
            )}

            <button
              className="lg:hidden text-gray-600 hover:text-amber-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <div className="text-2xl">☰</div>
            </button>

          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden border-t py-4 bg-white">
            <div className="flex flex-col space-y-4">

              <div className="cursor-pointer text-gray-700" onClick={() => navigate("/")}>Home</div>

              <div className="cursor-pointer text-gray-700" onClick={() => navigate("/products")}>All Cakes</div>

              <div className="cursor-pointer text-gray-700" onClick={handleOrdersClick}>My Orders</div>

              <div className="cursor-pointer text-gray-700" onClick={handleWishlistClick}>Wishlist</div>

              <div className="cursor-pointer text-gray-700" onClick={handleCartClick}>Cart</div>

              <div className="border-t pt-4 flex flex-col space-y-3">
                {user ? (
                  <>
                    <div className="text-gray-700 font-medium">Welcome, {user.username}</div>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg">
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg">
                    Login
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
