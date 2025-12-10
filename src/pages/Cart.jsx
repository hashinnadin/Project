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

  // ---------------- LOAD CART FROM USER OBJECT ----------------
  const loadCart = async () => {
    try {
      const res = await fetch(`http://localhost:3002/users/${user.id}`);
      const userData = await res.json();

      const cart = userData.cart || [];

      const formatted = cart.map((item) => ({
        id: Number(item.productId),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      setCartItems(formatted);
    } catch (error) {
      toast.error("Failed to load cart!");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UPDATE QUANTITY ----------------
const updateQuantity = async (productId, qty) => {
  if (qty < 1) return;

  try {
    const res = await fetch(`http://localhost:3002/users/${user.id}`);
    const userData = await res.json();

    let cart = userData.cart || [];

    cart = cart.map((item) =>
      Number(item.productId) === Number(productId)
        ? { ...item, quantity: qty }
        : item
    );

    await fetch(`http://localhost:3002/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart }),
    });

    setCartItems(
      cart.map((item) => ({
        id: Number(item.productId),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }))
    );

  } catch (error) {
    toast.error("Quantity update failed!");
  }
};


  // ---------------- REMOVE ITEM ----------------
  const removeItem = async (productId) => {
    try {
      const res = await fetch(`http://localhost:3002/users/${user.id}`);
      const userData = await res.json();

      let cart = userData.cart || [];

      cart = cart.filter(
        (item) => Number(item.productId) !== Number(productId)
      );

      await fetch(`http://localhost:3002/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart }),
      });

      setCartItems(
        cart.map((item) => ({
          id: Number(item.productId),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        }))
      );

      toast.success("Item removed!");
      window.dispatchEvent(new Event("updateCart"));
    } catch (error) {
      toast.error("Failed to remove item!");
    }
  };

  // ---------------- CHECKOUT ----------------
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    navigate("/payment");
  };

  // ---------------- CALCULATIONS ----------------
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your cart...</p>
      </div>
    );
  }

  // ---------------- EMPTY CART ----------------
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
        <button
          onClick={() => navigate("/products")}
          className="px-5 py-3 bg-rose-500 text-white rounded-lg"
        >
          <FaShoppingBag className="inline-block mr-2" />
          Browse Products
        </button>
      </div>
    );
  }

  // ---------------- MAIN UI ----------------
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">Shopping Cart</h1>
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 px-4 py-2 text-slate-600"
          >
            <FaArrowLeft />
            Continue Shopping
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="md:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="p-4 bg-white rounded-xl shadow-md">
                <div className="flex">

                  <img
                    src={item.image}
                    className="w-28 h-28 rounded-lg object-cover"
                  />

                  <div className="ml-4 flex-1">
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <p className="text-lg font-semibold text-emerald-600">
                      ₹{item.price}
                    </p>

                    <div className="flex items-center mt-3">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="px-3 py-1 bg-gray-200 rounded"
                      >
                        <FaMinus />
                      </button>

                      <span className="px-4 text-xl">{item.quantity}</span>

                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-3 py-1 bg-gray-200 rounded"
                      >
                        <FaPlus />
                      </button>
                    </div>

                    <p className="mt-2 font-bold">
                      Item Total: ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="px-3 py-3 text-red-600"
                  >
                    <FaTrash size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md h-fit">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

            <div className="flex justify-between mb-3">
              <span>Subtotal</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between mb-3">
              <span>Delivery</span>
              <span className="text-green-600 font-semibold">FREE</span>
            </div>

            <div className="flex justify-between border-t pt-4 text-xl font-bold">
              <span>Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-5 py-3 bg-emerald-600 text-white rounded-lg text-lg font-semibold"
            >
              Proceed to Checkout →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Cart;
