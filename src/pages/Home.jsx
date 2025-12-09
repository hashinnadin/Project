import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Footer from "../compenent/Footer";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:3002/products?_limit=6");
        setProducts(res.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load highlight cakes");
      }
    };

    fetchProducts();
  }, []);

  const addToCart = async (item) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:3002/cart?userId=${user.id}&productId=${item.id}`
      );

      if (res.data.length > 0) {
        const existing = res.data[0];

        await axios.patch(`http://localhost:3002/cart/${existing.id}`, {
          quantity: existing.quantity + 1,
        });

        toast.success("Quantity updated in cart!");
      } else {
        await axios.post("http://localhost:3002/cart", {
          userId: user.id,
          productId: item.id,
          productName: item.name,
          price: item.price,
          image: item.image,
          quantity: 1,
          date: new Date(),
        });

        toast.success(`${item.name} added to cart`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add to cart!");
    }
  };

  const addToWishlist = (item) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      toast.error("Please login to add items to wishlist");
      navigate("/login");
      return;
    }

    const oldWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const exists = oldWishlist.find((w) => w.id === item.id);

    if (exists) {
      toast.info("Already in wishlist");
      return;
    }

    oldWishlist.push(item);
    localStorage.setItem("wishlist", JSON.stringify(oldWishlist));
    toast.success(`${item.name} added to wishlist`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mb-4"></div>
          <p className="text-rose-600 font-medium">Loading featured cakes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800">

      {/* Hero Section */}
      <div 
        className="w-full h-[280px] md:h-[400px] bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 
        flex items-center justify-center text-center px-6 relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-white"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-white"></div>
        </div>

        <div className="relative z-10 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg mb-6">
            Sweet Moments, <span className="text-yellow-200">Delivered Fresh</span> 🍰
          </h1>

          <p className="text-white text-lg md:text-xl mb-8 opacity-95 font-light max-w-2xl mx-auto">
            Indulge in our artisan cakes, baked daily with premium ingredients and creative passion
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/products')}
              className="px-8 py-3 bg-white text-rose-600 font-semibold rounded-full 
              hover:bg-rose-50 hover:scale-105 transform transition-all duration-300 
              shadow-lg hover:shadow-xl"
            >
              Explore Collection
            </button>
            <button
              onClick={() => navigate('/categories')}
              className="px-8 py-3 bg-transparent border-2 border-white text-white 
              font-semibold rounded-full hover:bg-white/20 hover:scale-105 
              transform transition-all duration-300"
            >
              View Categories
            </button>
          </div>
        </div>
      </div>

      {/* Featured Cakes Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-rose-500 font-semibold text-sm uppercase tracking-wider">
                Our Selection
              </span>
            </div>
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Featured <span className="text-rose-500">Masterpieces</span>
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Discover our chef's special creations that are delighting customers every day
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((cake) => (
              <div
                key={cake.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl 
                transition-all duration-500 hover:-translate-y-2 border border-slate-100"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden h-64">
                  <img
                    src={cake.image}
                    alt={cake.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => addToWishlist(cake)}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center 
                      justify-center text-rose-500 hover:bg-rose-500 hover:text-white 
                      transition-colors duration-300 shadow-md"
                    >
                      <span className="text-lg">❤</span>
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                    <span className="text-white text-sm font-medium bg-rose-500 px-3 py-1 rounded-full">
                      {cake.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                      {cake.name}
                    </h3>
                    <span className="text-2xl font-bold text-rose-600">₹{cake.price}</span>
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-6 line-clamp-2">
                    {cake.description}
                  </p>

                  <button
                    onClick={() => addToCart(cake)}
                    className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white 
                    font-semibold rounded-lg hover:from-rose-600 hover:to-pink-600 
                    transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Add to Cart</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-transparent border-2 
              border-rose-500 text-rose-600 font-semibold rounded-full hover:bg-rose-50 
              hover:border-rose-600 transition-all duration-300 group"
            >
              View All Products
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl 
                flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Free Delivery</h3>
              <p className="text-slate-600">On orders above ₹999 within city limits</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl 
                flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🎂</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Fresh Daily</h3>
              <p className="text-slate-600">Baked fresh every morning, never frozen</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl 
                flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⭐</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Custom Orders</h3>
              <p className="text-slate-600">Personalized cakes for your special occasions</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;