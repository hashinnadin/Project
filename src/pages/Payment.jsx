import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCreditCard, FaMobileAlt, FaTruck, FaLock, FaCheck } from "react-icons/fa";

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

      // Redirect to home after 2 seconds
      setTimeout(() => navigate("/"), 2000);
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
      <div className="min-h-screen bg-gradient-to-br from-[#F9F8F6] to-[#EFE9E3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C9B59C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5D4737]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F8F6] to-[#EFE9E3] pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#5D4737] mb-3">Secure Checkout</h1>
          <p className="text-[#8B7355]">Complete your purchase with confidence</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Payment Form */}
          <div className="space-y-6">
            {/* Payment Method Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-[#D9CFC7] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] text-white">
                  <FaLock />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#5D4737]">Payment Method</h2>
                  <p className="text-sm text-[#8B7355]">Choose how you'd like to pay</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      paymentMethod === method.id
                        ? `border-[#C9B59C] bg-gradient-to-r ${method.color} text-white shadow-md`
                        : "border-[#D9CFC7] bg-white text-[#5D4737] hover:border-[#C9B59C]"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-medium">{method.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Payment Form */}
              <form onSubmit={handlePayment}>
                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#5D4737] mb-2">
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
                          errors.cardNumber ? "border-red-300" : "border-[#D9CFC7]"
                        } bg-[#F9F8F6] text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:border-transparent transition-all duration-200`}
                      />
                      {errors.cardNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#5D4737] mb-2">
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
                            errors.expiryDate ? "border-red-300" : "border-[#D9CFC7]"
                          } bg-[#F9F8F6] text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:border-transparent transition-all duration-200`}
                        />
                        {errors.expiryDate && (
                          <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#5D4737] mb-2">
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
                            errors.cvv ? "border-red-300" : "border-[#D9CFC7]"
                          } bg-[#F9F8F6] text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:border-transparent transition-all duration-200`}
                        />
                        {errors.cvv && (
                          <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#5D4737] mb-2">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        name="nameOnCard"
                        placeholder="John Doe"
                        value={formData.nameOnCard}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.nameOnCard ? "border-red-300" : "border-[#D9CFC7]"
                        } bg-[#F9F8F6] text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:border-transparent transition-all duration-200`}
                      />
                      {errors.nameOnCard && (
                        <p className="text-red-500 text-sm mt-1">{errors.nameOnCard}</p>
                      )}
                    </div>
                  </div>
                )}

                {paymentMethod === "upi" && (
                  <div>
                    <label className="block text-sm font-medium text-[#5D4737] mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      name="upiId"
                      placeholder="yourname@upi"
                      value={formData.upiId}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.upiId ? "border-red-300" : "border-[#D9CFC7]"
                      } bg-[#F9F8F6] text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:border-transparent transition-all duration-200`}
                    />
                    {errors.upiId && (
                      <p className="text-red-500 text-sm mt-1">{errors.upiId}</p>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-sm border border-[#D9CFC7] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] text-white">
                  <FaTruck />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#5D4737]">Delivery Address</h2>
                  <p className="text-sm text-[#8B7355]">Where should we deliver your order?</p>
                </div>
              </div>

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
                        addressErrors[field.name] ? "border-red-300" : "border-[#D9CFC7]"
                      } bg-[#F9F8F6] text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:border-transparent transition-all duration-200`}
                    />
                    {addressErrors[field.name] && (
                      <p className="text-red-500 text-sm mt-1">{addressErrors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none transition-all duration-200 flex items-center justify-center gap-3"
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
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-xl shadow-sm border border-[#D9CFC7] p-6">
              <h2 className="text-xl font-bold text-[#5D4737] mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 rounded-lg border border-[#EFE9E3] hover:border-[#D9CFC7] transition-colors">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#D9CFC7]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[#5D4737]">{item.name}</h3>
                      <p className="text-sm text-[#8B7355]">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#5D4737]">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                      <p className="text-sm text-[#8B7355]">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="space-y-3 border-t border-[#EFE9E3] pt-4">
                <div className="flex justify-between text-[#5D4737]">
                  <span>Subtotal</span>
                  <span>₹{getTotalPrice().toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[#5D4737]">
                  <span>Shipping</span>
                  <span>₹50.00</span>
                </div>
                <div className="flex justify-between text-[#5D4737]">
                  <span>Tax (5%)</span>
                  <span>₹{(getTotalPrice() * 0.05).toFixed(2)}</span>
                </div>
                <div className="border-t border-[#D9CFC7] pt-3">
                  <div className="flex justify-between text-lg font-bold text-[#5D4737]">
                    <span>Total Amount</span>
                    <span className="text-emerald-600">
                      ₹{(getTotalPrice() + 50 + (getTotalPrice() * 0.05)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="mt-6 p-4 bg-[#F9F8F6] rounded-lg border border-[#EFE9E3]">
                <div className="flex items-center gap-2 text-sm text-[#8B7355]">
                  <FaLock className="text-emerald-500" />
                  <span>Your payment is secured with 256-bit SSL encryption</span>
                </div>
              </div>

              {/* Back to Cart */}
              <button
                onClick={() => navigate("/cart")}
                className="w-full mt-4 py-3 rounded-lg border-2 border-[#D9CFC7] text-[#5D4737] font-medium hover:bg-[#F9F8F6] transition-colors"
              >
                ← Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;