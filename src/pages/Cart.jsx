import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaArrowLeft } from "react-icons/fa";

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
        `http://localhost:3002/cart?userId=${user.id}`
      );
      const data = await response.json();

      const formatted = data.map((item) => ({
        id: Number(item.productId),
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

  const updateQuantity = async (productId, qty) => {
    if (qty < 1) return;

    const updated = cartItems.map((item) =>
      item.id == productId ? { ...item, quantity: qty } : item
    );

    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));

    // Dispatch event to update navbar count
    window.dispatchEvent(new Event("updateCart"));

    const item = updated.find((i) => i.id == productId);

    try {
      await fetch(`http://localhost:3002/cart/${item.dbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: qty }),
      });

      toast.success("Updated!");
    } catch {
      toast.error("Server update failed!");
    }
  };

  const removeItem = async (productId) => {
    const item = cartItems.find((i) => i.id == productId);

    try {
      await fetch(`http://localhost:3002/cart/${item.dbId}`, {
        method: "DELETE",
      });
    } catch {
      toast.error("Failed to delete from server!");
    }

    const updated = cartItems.filter((i) => i.id != productId);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));

    // Dispatch event to update navbar count
    window.dispatchEvent(new Event("updateCart"));
    
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-rose-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mb-4"></div>
          <p className="text-rose-600 font-medium text-lg">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50 p-8 flex flex-col items-center justify-center">
        <div className="max-w-md text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-6xl text-rose-400">🛒</span>
          </div>
          <h2 className="text-4xl font-bold text-slate-800 mb-4">Your Cart is Empty</h2>
          <p className="text-slate-600 text-lg mb-8">
            Looks like you haven't added any delicious cakes to your cart yet
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white 
            font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 
            transition-all duration-300 hover:shadow-lg shadow-md flex items-center gap-2 mx-auto"
          >
            <FaShoppingBag />
            Browse Our Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">🛒</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800">Shopping Cart</h1>
                <p className="text-slate-600">{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</p>
              </div>
            </div>
            
            <button
              onClick={() => navigate("/products")}
              className="hidden md:flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-rose-600 
              hover:bg-rose-50 rounded-lg transition-all duration-300"
            >
              <FaArrowLeft />
              Continue Shopping
            </button>
          </div>
          
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full opacity-50"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 
                border border-slate-100 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  
                  {/* Product Image */}
                  <div className="sm:w-48 h-48 sm:h-auto overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-rose-600 transition-colors mb-2">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-2xl font-bold text-emerald-600">
                            ₹{item.price}
                          </span>
                          <span className="text-slate-500">each</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-10 h-10 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 
                            transition-colors flex items-center justify-center"
                          >
                            <FaMinus />
                          </button>
                          
                          <div className="w-12 h-12 bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg 
                          flex items-center justify-center">
                            <span className="text-xl font-bold text-slate-800">{item.quantity}</span>
                          </div>
                          
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 
                            transition-colors flex items-center justify-center"
                          >
                            <FaPlus />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-lg text-slate-500">Item Total</p>
                          <p className="text-2xl font-bold text-slate-800">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:text-white 
                        hover:bg-rose-500 rounded-lg transition-all duration-300"
                      >
                        <FaTrash />
                        Remove Item
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg 
                flex items-center justify-center">
                  <span className="text-white">💰</span>
                </div>
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="text-lg font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600">Delivery</span>
                  <span className="text-lg font-semibold text-emerald-600">FREE</span>
                </div>
                
                {/* Tax removed as requested */}
                
                <div className="flex justify-between items-center py-4 border-t border-slate-200">
                  <span className="text-xl font-bold text-slate-800">Total Amount</span>
                  <span className="text-3xl font-bold text-emerald-600">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white 
                font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 
                hover:shadow-xl shadow-lg text-lg flex items-center justify-center gap-3"
              >
                <span>Proceed to Checkout</span>
                <span className="text-xl">→</span>
              </button>

              <button
                onClick={() => navigate("/products")}
                className="w-full mt-4 py-3 bg-white border-2 border-slate-200 text-slate-700 
                font-semibold rounded-xl hover:border-emerald-500 hover:text-emerald-600 
                transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FaShoppingBag />
                Continue Shopping
              </button>

              {/* Security Note */}
              <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">🔒</span>
                  </div>
                  <div>
                    <p className="font-medium text-emerald-800 mb-1">Secure Checkout</p>
                    <p className="text-emerald-600 text-sm">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Empty Cart Reminder */}
            <div className="mt-6 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
              <p className="text-slate-600 text-sm">
                <span className="font-semibold text-rose-600">Note:</span> Items are reserved for 30 minutes. Complete checkout to secure your order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;