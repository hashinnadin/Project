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

  // Load products + read search param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("search") || "";
    setSearchTerm(searchQuery);

    fetchProducts(searchQuery);
  }, [location.search]);

  // Fetch products from backend
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

  // Filtering & sorting
  const filterAndSortProducts = (list, term, sortOption) => {
    let filtered = [...list];

    if (term.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term.toLowerCase()) ||
          p.category.toLowerCase().includes(term.toLowerCase())
      );
    }

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
    toast.error("Please login");
    return navigate("/login");
  }

  try {
    // 1. Fetch user from DB
    const res = await fetch(`http://localhost:3002/users/${user.id}`);
    const userData = await res.json();

    let cart = userData.cart || [];

    // 2. Check if product exists
    const existing = cart.find(c => c.productId === item.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        productId: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1
      });
    }

    // 3. Update user object in DB
    await fetch(`http://localhost:3002/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart })
    });

    toast.success(`${item.name} added to cart`);

    window.dispatchEvent(new Event("updateCart"));

  } catch (err) {
    console.log(err);
    toast.error("Failed to update cart!");
  }
};


  // ------------------ CLEAN ADD-TO-WISHLIST (NO LOCAL STORAGE) ------------------
  const addToWishlist = async (item) => {
  if (!user) {
    toast.error("Please login");
    return navigate("/login");
  }

  try {
    // 1. Get user record
    const res = await fetch(`http://localhost:3002/users/${user.id}`);
    const userData = await res.json();

    let wishlist = userData.wishlist || [];

    // 2. Check exist
    const exists = wishlist.find(w => w.productId === item.id);

    if (exists) {
      toast.info("Already in wishlist");
      return;
    }

    wishlist.push({
      productId: item.id,
      name: item.name,
      price: item.price,
      image: item.image
    });

    // 3. PATCH updated wishlist
    await fetch(`http://localhost:3002/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wishlist })
    });

    toast.success(`${item.name} added to wishlist`);
    window.dispatchEvent(new Event("updateWishlist"));

  } catch (err) {
    toast.error("Failed to update wishlist!");
  }
};

  // ------------------ LOADER ------------------
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

  // ------------------ UI ------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">

      {/* Header Section */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 py-12 px-4 text-center">
        <h1 className="text-5xl font-bold text-white mb-3">Our Delicious Collection</h1>
        <p className="text-white text-lg opacity-90 max-w-2xl mx-auto">
          Discover handcrafted cakes made with love, premium ingredients, and passion.
        </p>
      </div>

      {/* Search & Sort */}
      <div className="container mx-auto max-w-7xl p-6 bg-white mt-8 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">

          {/* Search */}
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search cakes, flavors, categories..."
            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-full
            focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none"
          />

          {/* Sort */}
          <select
            value={sortBy}
            onChange={handleSort}
            className="w-full md:w-52 px-4 py-3 border-2 border-slate-200 rounded-lg"
          >
            <option value="default">Sort by: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        {/* Search result count */}
        {searchTerm && (
          <p className="mt-4 text-center text-slate-600">
            Found <span className="font-bold text-rose-600">{filteredProducts.length}</span> results for "{searchTerm}"
          </p>
        )}
      </div>

      {/* Product Grid */}
      <div className="container mx-auto max-w-7xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

        {filteredProducts.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
          >
            {/* Image */}
            <div className="relative h-64 overflow-hidden cursor-pointer"
              onClick={() => navigate(`/product/${item.id}`)}
            >
              <img
                src={item.image}
                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
              />

              <span className="absolute top-4 left-4 bg-rose-600 text-white px-3 py-1 rounded-full text-xs">
                {item.category}
              </span>

              {/* Wishlist */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToWishlist(item);
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-rose-600"
              >
                ❤
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3
                className="text-xl font-bold mb-3 cursor-pointer group-hover:text-rose-600"
                onClick={() => navigate(`/product/${item.id}`)}
              >
                {item.name}
              </h3>

              <p className="text-slate-600 text-sm mb-4 line-clamp-2">{item.description}</p>

              <button
                onClick={() => addToCart(item)}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:opacity-90"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Count */}
      {filteredProducts.length > 0 && (
        <p className="text-center mt-10 text-slate-600">
          Showing {filteredProducts.length} delicious cakes
        </p>
      )}

      <Footer />
    </div>
  );
}

export default Product;
