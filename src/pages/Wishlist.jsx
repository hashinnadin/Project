import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Wishlist() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const res = await fetch(`http://localhost:3002/users/${user.id}`);
      const userData = await res.json();

      const wishlist = userData.wishlist || [];

      const formatted = wishlist.map((item) => ({
        id: Number(item.productId),
        name: item.name,
        price: item.price,
        image: item.image,
      }));

      setWishlistItems(formatted);
    } catch (error) {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      const res = await fetch(`http://localhost:3002/users/${user.id}`);
      const userData = await res.json();

      let wishlist = userData.wishlist || [];

      wishlist = wishlist.filter(
        (item) => Number(item.productId) !== Number(itemId)
      );

      await fetch(`http://localhost:3002/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wishlist }),
      });

      setWishlistItems(
        wishlist.map((item) => ({
          id: Number(item.productId),
          name: item.name,
          price: item.price,
          image: item.image,
        }))
      );

      toast.success("Removed from wishlist!");
    } catch (error) {
      toast.error("Failed to remove item!");
    }
  };

  const addToCart = async (item) => {
    try {
      const res = await fetch(`http://localhost:3002/users/${user.id}`);
      const userData = await res.json();

      let cart = userData.cart || [];

      const existing = cart.find(
        (c) => Number(c.productId) === Number(item.id)
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          productId: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: 1,
        });
      }

      await fetch(`http://localhost:3002/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart }),
      });

      toast.success(`${item.name} added to cart!`);
      window.dispatchEvent(new Event("updateCart"));
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const moveAllToCart = async () => {
    try {
      const res = await fetch(`http://localhost:3002/users/${user.id}`);
      const userData = await res.json();

      let cart = userData.cart || [];
      let wishlist = userData.wishlist || [];

      wishlist.forEach((item) => {
        const existing = cart.find(
          (c) => Number(c.productId) === Number(item.productId)
        );

        if (existing) {
          existing.quantity += 1;
        } else {
          cart.push({ ...item, quantity: 1 });
        }
      });

      wishlist = [];

      await fetch(`http://localhost:3002/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, wishlist }),
      });

      setWishlistItems([]);

      toast.success("All items moved to cart!");
      window.dispatchEvent(new Event("updateCart"));
    } catch (err) {
      toast.error("Failed to move items!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading wishlist...</p>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4">No items in wishlist</h2>
        <button
          onClick={() => navigate("/products")}
          className="px-5 py-3 bg-rose-500 text-white rounded-lg"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between mb-8">
          <h1 className="text-4xl font-bold">My Wishlist</h1>

          <button
            onClick={moveAllToCart}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg"
          >
            Move All to Cart
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlistItems.map((item) => (
            <div key={item.id} className="p-4 bg-white rounded-xl shadow-md">
              <img
                src={item.image}
                className="w-full h-48 object-cover rounded-lg"
              />

              <h3 className="text-xl font-bold mt-3">{item.name}</h3>
              <p className="text-lg font-semibold text-rose-500">
                ₹{item.price}
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => addToCart(item)}
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-lg"
                >
                  Add to Cart
                </button>

                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="w-12 py-2 bg-red-100 text-red-600 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Wishlist;
