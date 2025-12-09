import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Footer from "./Footer";

function Product() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("search") || "";
    setSearchTerm(searchQuery);

    fetchProducts(searchQuery);
  }, [location.search]);

  const fetchProducts = async (searchQuery) => {
    try {
      const response = await fetch("http://localhost:3002/products");
      const data = await response.json();

      setProducts(data);
      filterAndSortProducts(data, searchQuery, sortBy);
    } catch (error) {
      toast.error("Failed to load products from server!");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = (list, term, sortOption) => {
    let filtered = [...list];
    
    // Filter by search term
    if (term.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term.toLowerCase()) ||
          p.category.toLowerCase().includes(term.toLowerCase())
      );
    }

    // Sort products
    switch (sortOption) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Default sort (by id or keep original)
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterAndSortProducts(products, value, sortBy);
  };

  const handleSort = (e) => {
    const value = e.target.value;
    setSortBy(value);
    filterAndSortProducts(products, searchTerm, value);
  };

  const addToCart = async (item) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      const serverCheck = await fetch(
        `http://localhost:3002/cart?userId=${user.id}&productId=${item.id}`
      );
      const existsDB = await serverCheck.json();

      if (existsDB.length > 0) {
        await fetch(`http://localhost:3002/cart/${existsDB[0].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: existsDB[0].quantity + 1 }),
        });
      } else {
        await fetch("http://localhost:3002/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            productId: item.id,
            productName: item.name,
            price: item.price,
            quantity: 1,
            image: item.image,
            date: new Date().toISOString(),
          }),
        });
      }

      let localCart = JSON.parse(localStorage.getItem("cart")) || [];

      const existingLocal = localCart.find(
        (c) => Number(c.productId) === Number(item.id)
      );

      if (existingLocal) {
        existingLocal.quantity += 1;
      } else {
        localCart.push({
          productId: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(localCart));

      window.dispatchEvent(new Event("updateCart"));

      toast.success(`${item.name} added to cart`);
    } catch (error) {
      toast.error("Failed to add item to cart!");
    }
  };

  const addToWishlist = async (item) => {
    if (!user) {
      toast.error("Please login to add items to wishlist");
      navigate("/login");
      return;
    }

    try {
      const check = await fetch(
        `http://localhost:3002/wishlist?userId=${user.id}&productId=${item.id}`
      );
      const existsDB = await check.json();

      if (existsDB.length > 0) {
        toast.info("Already in wishlist");
        return;
      }

      await fetch("http://localhost:3002/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          productId: item.id,
          productName: item.name,
          price: item.price,
          image: item.image,
          date: new Date().toISOString(),
        }),
      });

      let oldWish = JSON.parse(localStorage.getItem("wishlist")) || [];

      const existsLocal = oldWish.find(
        (w) => Number(w.id) === Number(item.id)
      );

      if (!existsLocal) {
        oldWish.push({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
        });
      }

      localStorage.setItem("wishlist", JSON.stringify(oldWish));

      window.dispatchEvent(new Event("updateWishlist"));

      toast.success(`${item.name} added to wishlist`);
    } catch (error) {
      toast.error("Failed to add item to wishlist!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mb-4"></div>
          <p className="text-rose-600 font-medium text-lg">Loading our collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 py-12 px-4">
        <div className="container mx-auto max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Delicious Collection
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Discover handcrafted cakes made with love, premium ingredients, and creative passion
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl p-4 md:p-6">
        
        {/* Search and Filter Bar */}
        <div className="mb-12 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search for cakes, flavors, or categories..."
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-full 
                  focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none 
                  transition-all duration-300"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <select
                value={sortBy}
                onChange={handleSort}
                className="w-full md:w-48 px-4 py-3 bg-white border-2 border-slate-200 
                rounded-lg focus:border-rose-400 focus:ring-2 focus:ring-rose-200 
                outline-none transition-all duration-300"
              >
                <option value="default">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {searchTerm && (
            <div className="mt-4 text-center">
              <p className="text-slate-600">
                Found <span className="font-bold text-rose-600">{filteredProducts.length}</span> 
                {filteredProducts.length === 1 ? ' product' : ' products'} for "{searchTerm}"
              </p>
            </div>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl 
                transition-all duration-500 hover:-translate-y-2 border border-slate-100"
              >
                {/* Image Container */}
                <div 
                  className="relative overflow-hidden h-64 cursor-pointer"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Category Badge */}
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-pink-500 
                  text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                    {item.category}
                  </span>
                  
                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToWishlist(item);
                    }}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm 
                    rounded-full flex items-center justify-center text-rose-500 
                    hover:bg-rose-500 hover:text-white transition-all duration-300 
                    shadow-md hover:scale-110"
                  >
                    <span className="text-lg">❤</span>
                  </button>
                  
                  {/* Price Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t 
                  from-black/70 to-transparent p-4">
                    <p className="text-2xl font-bold text-white">
                      ₹{item.price}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 
                    className="text-xl font-bold text-slate-800 group-hover:text-rose-600 
                    transition-colors mb-3 cursor-pointer line-clamp-2"
                    onClick={() => navigate(`/product/${item.id}`)}
                  >
                    {item.name}
                  </h3>
                  
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  <button
                    onClick={() => addToCart(item)}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white 
                    font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 
                    transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full 
              flex items-center justify-center mx-auto mb-8">
                <span className="text-6xl text-slate-400">🍰</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-4">
                No cakes found
              </h3>
              <p className="text-slate-600 text-lg mb-8">
                We couldn't find any cakes matching "{searchTerm}". Try another search term or browse all cakes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    filterAndSortProducts(products, "", sortBy);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white 
                  font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 
                  transition-all duration-300"
                >
                  View All Cakes
                </button>
                <button
                  onClick={() => navigate("/categories")}
                  className="px-6 py-3 bg-transparent border-2 border-slate-300 text-slate-700 
                  font-semibold rounded-full hover:bg-slate-50 transition-all duration-300"
                >
                  Browse Categories
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Count */}
        {filteredProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200 text-center">
            <p className="text-slate-600">
              Showing <span className="font-bold text-rose-600">{filteredProducts.length}</span> 
              {filteredProducts.length === 1 ? ' delicious cake' : ' delicious cakes'} 
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Product;