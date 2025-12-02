import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/cart?userId=${user.id}`
      );
      const data = await response.json();

      const formatted = data.map((item) => ({
        id: item.productId,
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        dbId: item.id,
      }));

      setCartItems(formatted);
      localStorage.setItem("cart", JSON.stringify(formatted));
    } catch (error) {
      toast.error("Failed to load cart!");
    } finally {
      setLoading(false);
    }
  };

  // UPDATE QUANTITY 
  const updateQuantity = async (productId, qty) => {
    if (qty < 1) return;

    const updated = cartItems.map((item) =>
      item.id === productId ? { ...item, quantity: qty } : item
    );

    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));

    const item = updated.find((i) => i.id === productId);

    try {
      await fetch(`http://localhost:3001/cart/${item.dbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: qty }),
      });

      window.dispatchEvent(new Event("storage"));
      toast.success("Updated!");
    } catch {
      toast.error("Server update failed!");
    }
  };

  const removeItem = async (productId) => {
    const item = cartItems.find((i) => i.id === productId);

    try {
      await fetch(`http://localhost:3001/cart/${item.dbId}`, {
        method: "DELETE",
      });
    } catch {
      toast.error("Failed to delete from server!");
    }

    const updated = cartItems.filter((i) => i.id !== productId);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    toast.success("Item removed!");
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );


  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    navigate("/payment");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-amber-600">
        Loading cart...
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 text-center p-10">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <button
          onClick={() => navigate("/products")}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg"
        >
          Browse Cakes
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">
          Shopping Cart ({totalItems} items)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 py-6 border-b border-gray-200"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{item.name}</h3>
                  <p className="text-amber-600 font-bold text-lg">
                    ₹{item.price}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="w-8 h-8 hover:bg-gray-200 rounded"
                    >
                      -
                    </button>

                    <span className="text-lg w-6 text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="w-8 h-8 hover:bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-amber-600">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 text-sm mt-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-6 h-fit">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
{/* 
               <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>₹50.00</span>
              </div> */}

              {/* <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>  */}

              <div className="border-t pt-3 flex justify-between font-bold text-xl">
                <span>Total</span>
                <span className="text-amber-600">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg mt-6"
            >
              Proceed to Payment
            </button>

            <button
              onClick={() => navigate("/products")}
              className="w-full bg-gray-100 hover:bg-gray-200 mt-3 py-3 rounded-lg"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
