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
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading featured cakes...
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white text-gray-900">

      <div 
        className="w-full h-[280px] md:h-[350px] bg-gradient-to-r from-amber-500 to-orange-600 
        flex items-center justify-center text-center px-6 animate__animated animate__fadeIn"
      >
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">
            Freshly Baked Happiness, Just for You! 🎂
          </h1>

          <p className="text-white text-lg md:text-xl mt-4 opacity-90">
            Handcrafted cakes made with love, quality ingredients, and a touch of magic ✨
          </p>

          <button
            onClick={() => navigate('/products')}
            className="mt-6 bg-white text-amber-700 font-semibold px-6 py-3 rounded-lg shadow-lg 
            hover:bg-amber-100 transition-all duration-300"
          >
            Explore All Cakes →
          </button>
        </div>
      </div>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Cakes</h2>
            <p className="text-gray-600 text-lg">
              Our best-selling handcrafted cakes, just for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((cake) => (
              <div
                key={cake.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              >
                <img
                  src={cake.image}
                  alt={cake.name}
                  className="w-full h-56 object-cover"
                  
                />

                <div className="p-4">
                  <h3 className="text-xl font-semibold">{cake.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{cake.category}</p>
                  <p className="text-lg font-bold mt-3">₹{cake.price}</p>

                  <p className="text-gray-600 text-sm mt-2">{cake.description}</p>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => addToCart(cake)}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-semibold transition-colors"
                    >
                      Add to Cart
                    </button>

                    <button
                      onClick={() => addToWishlist(cake)}
                      className="w-12 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg transition-all"
                    >
                      ♡
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Home;
