import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCreditCard, FaMobileAlt, FaTruck, FaLock, FaCheck, FaArrowLeft } from "react-icons/fa";

function Payment() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    upiId: "",
  });

  const [errors, setErrors] = useState({});

  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    house: "",
    street: "",
    city: "",
    pincode: "",
    state: "",
  });

  const [addressErrors, setAddressErrors] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!u) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      navigate("/cart");
      return;
    }

    setUser(u);
    setCartItems(cart);
  }, [navigate]);

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;

    if (name === "cardNumber") {
      v = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
    }

    if (name === "expiryDate") {
      v = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5);
    }

    if (name === "cvv") {
      v = value.replace(/\D/g, "").slice(0, 3);
    }

    setFormData({ ...formData, [name]: v });
    setErrors({ ...errors, [name]: "" });
  };

  const handleAddressInput = (e) => {
    const { name, value } = e.target;
    let v = value;

    // Format mobile number
    if (name === "mobile") {
      v = value.replace(/\D/g, "").slice(0, 10);
    }

    // Format pincode
    if (name === "pincode") {
      v = value.replace(/\D/g, "").slice(0, 6);
    }

    setAddress({ ...address, [name]: v });
    setAddressErrors({ ...addressErrors, [name]: "" });
  };

  const validate = () => {
    const err = {};
    const addrErr = {};

    // Payment validation
    if (paymentMethod === "card") {
      const cleanCardNumber = formData.cardNumber.replace(/\s/g, "");
      if (!cleanCardNumber) err.cardNumber = "Card number is required";
      else if (cleanCardNumber.length !== 16) err.cardNumber = "Enter valid 16-digit card number";

      if (!formData.expiryDate) err.expiryDate = "Expiry date is required";
      else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) err.expiryDate = "Format: MM/YY";

      if (!formData.cvv) err.cvv = "CVV is required";
      else if (formData.cvv.length !== 3) err.cvv = "CVV must be 3 digits";

      if (!formData.nameOnCard.trim()) err.nameOnCard = "Name on card is required";
    }

    if (paymentMethod === "upi") {
      if (!formData.upiId.trim()) err.upiId = "UPI ID is required";
      else if (!formData.upiId.includes("@")) err.upiId = "Invalid UPI ID format";
    }

    // Address validation
    if (!address.fullName.trim()) addrErr.fullName = "Full name is required";
    
    if (!address.mobile) addrErr.mobile = "Mobile number is required";
    else if (address.mobile.length !== 10) addrErr.mobile = "Enter valid 10-digit mobile number";
    
    if (!address.house.trim()) addrErr.house = "House/Building is required";
    if (!address.street.trim()) addrErr.street = "Street/Area is required";
    if (!address.city.trim()) addrErr.city = "City is required";
    
    if (!address.pincode) addrErr.pincode = "Pincode is required";
    else if (address.pincode.length !== 6) addrErr.pincode = "Enter valid 6-digit pincode";
    
    if (!address.state.trim()) addrErr.state = "State is required";

    setErrors(err);
    setAddressErrors(addrErr);

    return Object.keys(err).length === 0 && Object.keys(addrErr).length === 0;
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the errors before continuing");
      return;
    }

    setLoading(true);

    try {
      const totalAmount = getTotalPrice();
      const order = {
        userId: user.id,
        items: cartItems.map(item => ({
          ...item,
          dbId: item.id // Preserve original ID
        })),
        totalAmount,
        paymentMethod,
        paymentStatus: "completed",
        address,
        date: new Date().toISOString(),
        status: "Success",
      };

      const response = await fetch("http://localhost:3002/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (!response.ok) throw new Error("Failed to create order");

      // Clear server cart if exists
      try {
        const cartResponse = await fetch(`http://localhost:3002/cart?userId=${user.id}`);
        if (cartResponse.ok) {
          const serverCart = await cartResponse.json();
          for (const item of serverCart) {
            await fetch(`http://localhost:3002/cart/${item.id}`, { 
              method: "DELETE" 
            });
          }
        }
      } catch (error) {
        console.warn("Could not clear server cart:", error);
      }

      // Clear local cart
      localStorage.setItem("cart", JSON.stringify([]));

      toast.success("🎉 Order placed successfully!");

      // Redirect to orders page after 2 seconds
      setTimeout(() => navigate("/orders"), 2000);
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Payment failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: "card", label: "Card", icon: <FaCreditCard />, color: "from-blue-500 to-blue-600" },
    { id: "upi", label: "UPI", icon: <FaMobileAlt />, color: "from-purple-500 to-purple-600" },
  ];

  const addressFields = [
    { placeholder: "Full Name", name: "fullName" },
    { placeholder: "Mobile Number", name: "mobile", type: "tel" },
    { placeholder: "House / Building", name: "house" },
    { placeholder: "Street / Area", name: "street" },
    { placeholder: "City", name: "city" },
    { placeholder: "Pincode", name: "pincode", type: "tel" },
    { placeholder: "State", name: "state" },
  ];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mb-4"></div>
          <p className="text-rose-600 font-medium">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-lg transition-all duration-300"
            >
              <FaArrowLeft />
              Back to Cart
            </button>
          </div>
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaLock className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
              Secure Checkout
            </h1>
            <p className="text-slate-600 text-lg">
              Complete your purchase with confidence
            </p>
          </div>
          
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full opacity-50"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Order Summary */}
          <div className="lg:col-span-2">
            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">📦</span>
                </div>
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/50 transition-all duration-300"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 mb-1">{item.name}</h3>
                      <p className="text-slate-500 text-sm">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800 text-lg">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                      <p className="text-slate-500 text-sm">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-slate-100 pt-6">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-semibold text-slate-800">₹{getTotalPrice().toLocaleString("en-IN")}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-600">Delivery</span>
                    <span className="font-semibold text-emerald-600">FREE</span>
                  </div>
                  
                  <div className="flex justify-between py-4 border-t border-slate-200">
                    <span className="text-xl font-bold text-slate-800">Total Amount</span>
                    <span className="text-3xl font-bold text-emerald-600">
                      ₹{getTotalPrice().toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <FaTruck className="text-white" />
                </div>
                Delivery Address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addressFields.map((field) => (
                  <div key={field.name} className={field.name === "street" || field.name === "house" ? "md:col-span-2" : ""}>
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={address[field.name]}
                      onChange={handleAddressInput}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        addressErrors[field.name] ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"
                      } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300`}
                    />
                    {addressErrors[field.name] && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <span>⚠️</span> {addressErrors[field.name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Payment */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <FaCreditCard className="text-white" />
                </div>
                Payment Method
              </h2>

              {/* Payment Method Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      paymentMethod === method.id
                        ? `border-blue-500 bg-gradient-to-r ${method.color} text-white shadow-lg`
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-semibold">{method.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Payment Form */}
              <form onSubmit={handlePayment}>
                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.cardNumber ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"
                        } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                      />
                      {errors.cardNumber && (
                        <p className="text-red-500 text-sm mt-2">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          placeholder="MM/YY"
                          maxLength="5"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.expiryDate ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"
                          } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                        />
                        {errors.expiryDate && (
                          <p className="text-red-500 text-sm mt-2">{errors.expiryDate}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="password"
                          name="cvv"
                          placeholder="123"
                          maxLength="3"
                          value={formData.cvv}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.cvv ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"
                          } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                        />
                        {errors.cvv && (
                          <p className="text-red-500 text-sm mt-2">{errors.cvv}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        name="nameOnCard"
                        placeholder="John Doe"
                        value={formData.nameOnCard}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.nameOnCard ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"
                        } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                      />
                      {errors.nameOnCard && (
                        <p className="text-red-500 text-sm mt-2">{errors.nameOnCard}</p>
                      )}
                    </div>
                  </div>
                )}

                {paymentMethod === "upi" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      name="upiId"
                      placeholder="yourname@upi"
                      value={formData.upiId}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.upiId ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"
                      } text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                    />
                    {errors.upiId && (
                      <p className="text-red-500 text-sm mt-2">{errors.upiId}</p>
                    )}
                  </div>
                )}

                {/* Pay Button */}
                <button
                  type="submit"
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white 
                  font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 
                  hover:shadow-xl shadow-lg text-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Pay ₹{getTotalPrice().toLocaleString("en-IN")}
                    </>
                  )}
                </button>
              </form>

              {/* Security Info */}
              <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaLock className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-800 mb-1">Secure Payment</p>
                    <p className="text-emerald-600 text-sm">
                      Your payment is protected with 256-bit SSL encryption
                    </p>
                  </div>
                </div>
              </div>

              {/* Guarantee */}
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-800 mb-1">100% Satisfaction Guarantee</p>
                    <p className="text-blue-600 text-sm">
                      If you're not happy, we'll make it right
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;