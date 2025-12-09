import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Wishlist() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(userData);
  }, []);

  useEffect(() => {
    if (user) loadWishlistItems();
  }, [user]);

  const loadWishlistItems = async () => {
    try {
      const localWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

      const response = await fetch(
        `http://localhost:3002/wishlist?userId=${user.id}`
      );
      const dbWishlist = await response.json();
      
      const merged = [...localWishlist];

      dbWishlist.forEach((dbItem) => {
        const productId = Number(dbItem.productId);

        if (!merged.find((item) => Number(item.id) === productId)) {
          merged.push({
            id: productId,
            name: dbItem.productName,
            price: dbItem.price,
            image: dbItem.image,
          });
        }
      });

      setWishlistItems(merged);
      localStorage.setItem("wishlist", JSON.stringify(merged));
    } catch (error) {
      console.error("Error loading wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId) => {
    const updated = wishlistItems.filter(
      (item) => Number(item.id) !== Number(itemId)
    );

    setWishlistItems(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));

    try {
      const res = await fetch(
        `http://localhost:3002/wishlist?userId=${user.id}&productId=${itemId}`
      );
      const existing = await res.json();

      if (existing.length > 0) {
        await fetch(`http://localhost:3002/wishlist/${existing[0].id}`, {
          method: "DELETE",
        });
      }
    } catch (err) {
      console.error("Server error:", err);
    }

    window.dispatchEvent(new Event("storage"));
    toast.success("Removed from wishlist!");
  };

  const addToCart = async (item) => {
    if (!user) {
      toast.error("Please login to add items");
      navigate("/login");
      return;
    }

    const oldCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingLocal = oldCart.find((c) => Number(c.id) === Number(item.id));

    if (existingLocal) {
      existingLocal.quantity += 1;
    } else {
      oldCart.push({ ...item, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(oldCart));

    try {
      const check = await fetch(
        `http://localhost:3002/cart?userId=${user.id}&productId=${item.id}`
      );
      const exists = await check.json();

      if (exists.length === 0) {
        await fetch("http://localhost:3002/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            productId: Number(item.id),
            productName: item.name,
            price: item.price,
            quantity: 1,
            image: item.image,
            date: new Date().toISOString(),
          }),
        });
      } else {
        await fetch(`http://localhost:3002/cart/${exists[0].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: exists[0].quantity + 1 }),
        });
      }

      window.dispatchEvent(new Event("storage"));
      toast.success(`${item.name} added to cart!`);
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const moveAllToCart = async () => {
    for (const item of wishlistItems) {
      await addToCart(item);
    }

    setWishlistItems([]);
    localStorage.setItem("wishlist", "[]");

    try {
      const res = await fetch(`http://localhost:3002/wishlist?userId=${user.id}`);
      const dbItems = await res.json();

      for (const w of dbItems) {
        await fetch(`http://localhost:3002/wishlist/${w.id}`, {
          method: "DELETE",
        });
      }
    } catch (err) {
      console.error("Failed to clear server wishlist:", err);
    }

    toast.success("All items moved to cart!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-rose-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mb-4"></div>
          <p className="text-rose-600 font-medium text-lg">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50 p-8 flex flex-col items-center justify-center">
        <div className="max-w-md text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-6xl text-rose-400">💝</span>
          </div>
          <h2 className="text-4xl font-bold text-slate-800 mb-4">Your Wishlist Awaits</h2>
          <p className="text-slate-600 text-lg mb-8">
            Save your favorite cakes here to revisit them later
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white 
            font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 
            transition-all duration-300 hover:shadow-lg shadow-md"
          >
            Discover Sweet Treats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 p-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">❤️</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
                  My Wishlist
                </h1>
              </div>
              <p className="text-slate-600">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>

            <button
              onClick={moveAllToCart}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white 
              font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 
              transition-all duration-300 hover:shadow-lg shadow-md flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              Move All to Cart
            </button>
          </div>

          <div className="h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-full opacity-50"></div>
        </div>

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl 
              transition-all duration-500 hover:-translate-y-2 border border-slate-100"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden h-56">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Remove Button */}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm 
                  rounded-full flex items-center justify-center text-rose-500 
                  hover:bg-rose-500 hover:text-white transition-all duration-300 
                  shadow-md hover:rotate-90"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
                
                {/* Price Badge */}
                <div className="absolute bottom-4 left-4">
                  <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white 
                  font-bold px-4 py-2 rounded-full shadow-lg">
                    ₹{item.price}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-rose-600 
                transition-colors mb-3 line-clamp-2">
                  {item.name}
                </h3>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => addToCart(item)}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white 
                    font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 
                    transition-all duration-300 hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    Add to Cart
                  </button>
                  
                  <button
                    onClick={() => navigate(`/product/${item.id}`)}
                    className="w-12 bg-slate-100 hover:bg-slate-200 text-slate-700 
                    rounded-lg transition-colors duration-300 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-16 text-center border-t border-slate-200 pt-12">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Found everything you love?
          </h3>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Continue exploring our collection of delicious cakes and desserts
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-8 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white 
            font-semibold rounded-full hover:from-slate-700 hover:to-slate-800 
            transition-all duration-300 hover:shadow-lg inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default Wishlist;