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
      const response = await fetch(`http://localhost:3001/wishlist?userId=${user.id}`);
      const dbWishlist = await response.json();

      const merged = [...localWishlist];

      dbWishlist.forEach((dbItem) => {
        if (!merged.find((item) => item.id === dbItem.productId)) {
          merged.push({
            id: dbItem.productId,
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
    const updated = wishlistItems.filter((item) => item.id !== itemId);
    setWishlistItems(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));

    try {
      const res = await fetch(
        `http://localhost:3001/wishlist?userId=${user.id}&productId=${itemId}`
      );
      const existing = await res.json();

      if (existing.length > 0) {
        await fetch(`http://localhost:3001/wishlist/${existing[0].id}`, {
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
    const existingLocal = oldCart.find((c) => c.id === item.id);

    if (existingLocal) {
      existingLocal.quantity += 1;
    } else {
      oldCart.push({ ...item, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(oldCart));

    try {
      const check = await fetch(
        `http://localhost:3001/cart?userId=${user.id}&productId=${item.id}`
      );
      const exists = await check.json();

      if (exists.length === 0) {
        await fetch("http://localhost:3001/cart", {
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
      } else {
        await fetch(`http://localhost:3001/cart/${exists[0].id}`, {
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
      const res = await fetch(`http://localhost:3001/wishlist?userId=${user.id}`);
      const dbItems = await res.json();

      for (const w of dbItems) {
        await fetch(`http://localhost:3001/wishlist/${w.id}`, {
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
      <div className="min-h-screen flex items-center justify-center text-xl text-amber-600">
        Loading wishlist...
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 text-center">
        <div className="text-6xl mb-4">❤️</div>
        <h2 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h2>
        <button
          onClick={() => navigate("/products")}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg"
        >
          Explore Cakes
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            My Wishlist ({wishlistItems.length} items)
          </h1>

          <button
            onClick={moveAllToCart}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg"
          >
            Move All to Cart
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                >
                  ✕
                </button>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-amber-600 text-xl font-bold">₹{item.price}</p>

                <button
                  onClick={() => addToCart(item)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg mt-4"
                >
                  Add to Cart
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
