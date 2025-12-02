import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Payment() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    upiId: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);

    if (!userData) {
      navigate("/login");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      navigate("/cart");
      return;
    }

    setCartItems(cart);
  }, [navigate]);

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getFinalTotal = () => {
    const subtotal = getTotalPrice();
    const delivery = 50;
    const tax = subtotal * 0.05;
    return subtotal + delivery + tax;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cardNumber") {
      formattedValue = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
    }

    if (name === "expiryDate") {
      formattedValue = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5);
    }

    setFormData({ ...formData, [name]: formattedValue });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (paymentMethod === "card") {
      if (!formData.cardNumber) {
        newErrors.cardNumber = "Card number is required";
      } else if (formData.cardNumber.replace(/\s/g, "").length !== 16) {
        newErrors.cardNumber = "Card number must be 16 digits";
      }

      if (!formData.expiryDate) {
        newErrors.expiryDate = "Expiry date is required";
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = "Use MM/YY format";
      }

      if (!formData.cvv) {
        newErrors.cvv = "CVV is required";
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = "CVV must be 3 or 4 digits";
      }

      if (!formData.nameOnCard.trim()) {
        newErrors.nameOnCard = "Name on card is required";
      }
    }

    if (paymentMethod === "upi") {
      if (!formData.upiId) {
        newErrors.upiId = "UPI ID is required";
      } else if (!/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
        newErrors.upiId = "Invalid UPI ID format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before proceeding");
      return;
    }

    setLoading(true);

    try {
      const order = {
        userId: user.id,
        items: cartItems,
        totalAmount: getFinalTotal(),
        paymentMethod: paymentMethod,
        paymentStatus: "completed",
        orderDate: new Date().toISOString(),
        deliveryAddress: "User address here",
        status: "processing"
      };

      await fetch("http://localhost:3001/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });

      const cartRes = await fetch(`http://localhost:3001/cart?userId=${user.id}`);
      const serverCart = await cartRes.json();

      for (const item of serverCart) {
        await fetch(`http://localhost:3001/cart/${item.id}`, {
          method: "DELETE"
        });
      }

      localStorage.setItem("cart", JSON.stringify([]));
      localStorage.setItem("wishlist", JSON.stringify([]));

      window.dispatchEvent(new Event("storage"));

      toast.success("Payment successful! Your order has been placed.");

      setTimeout(() => {
        navigate("/home");
      }, 2000);
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-amber-600 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Method</h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { id: "card", label: "Card", icon: "💳" },
                { id: "upi", label: "UPI", icon: "📱" },
                { id: "cod", label: "COD", icon: "💰" }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`py-4 rounded-lg border-2 transition-all ${
                    paymentMethod === m.id
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">{m.icon}</div>
                  <div className="text-sm font-medium">{m.label}</div>
                </button>
              ))}
            </div>

            {/* Payment Form */}
            <form onSubmit={handlePayment}>
              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      maxLength={19}
                      className={`w-full px-4 py-3 border rounded-lg ${
                        errors.cardNumber
                          ? "border-red-500"
                          : "border-gray-300 focus:ring-amber-500"
                      }`}
                      placeholder="1234 5678 9012 3456"
                    />
                    {errors.cardNumber && (
                      <p className="text-red-500 text-sm">{errors.cardNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        maxLength={5}
                        className={`w-full px-4 py-3 border rounded-lg ${
                          errors.expiryDate
                            ? "border-red-500"
                            : "border-gray-300 focus:ring-amber-500"
                        }`}
                        placeholder="MM/YY"
                      />
                      {errors.expiryDate && (
                        <p className="text-red-500 text-sm">{errors.expiryDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        maxLength={4}
                        className={`w-full px-4 py-3 border rounded-lg ${
                          errors.cvv
                            ? "border-red-500"
                            : "border-gray-300 focus:ring-amber-500"
                        }`}
                        placeholder="123"
                      />
                      {errors.cvv && (
                        <p className="text-red-500 text-sm">{errors.cvv}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Name on Card</label>
                    <input
                      type="text"
                      name="nameOnCard"
                      value={formData.nameOnCard}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg ${
                        errors.nameOnCard
                          ? "border-red-500"
                          : "border-gray-300 focus:ring-amber-500"
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.nameOnCard && (
                      <p className="text-red-500 text-sm">{errors.nameOnCard}</p>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div>
                  <label className="block text-gray-700 mb-2">UPI ID</label>
                  <input
                    type="text"
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg ${
                      errors.upiId
                        ? "border-red-500"
                        : "border-gray-300 focus:ring-amber-500"
                    }`}
                    placeholder="yourname@upi"
                  />
                  {errors.upiId && (
                    <p className="text-red-500 text-sm">{errors.upiId}</p>
                  )}
                </div>
              )}

              {paymentMethod === "cod" && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">💰</div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Cash on Delivery
                  </h3>
                  <p className="text-gray-600">
                    Pay when you receive your order
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white py-3 rounded-lg font-semibold text-lg mt-6"
              >
                {loading
                  ? "Processing..."
                  : `Pay ₹${getFinalTotal().toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-md p-6 h-fit sticky top-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-gray-500 text-sm">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="text-amber-600 font-semibold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">
                  ₹{getTotalPrice().toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Delivery:</span>
                <span className="font-semibold">₹50.00</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tax (5%):</span>
                <span className="font-semibold">
                  ₹{(getTotalPrice() * 0.05).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                <span className="text-gray-800">Total:</span>
                <span className="text-amber-600">
                  ₹{getFinalTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
