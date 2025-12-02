import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Payment() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);

  // Payment fields
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    upiId: "",
  });

  const [errors, setErrors] = useState({});

  // Address fields (required for both card & UPI)
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

  // User
  const [user, setUser] = useState(null);

  // Load user & cart
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!u) return navigate("/login");
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return navigate("/cart");
    }

    setUser(u);
    setCartItems(cart);
  }, []);

  // subtotal
  const getTotalPrice = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // format input
  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;

    if (name === "cardNumber") {
      v = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
    }

    if (name === "expiryDate") {
      v = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5);
    }

    setFormData({ ...formData, [name]: v });
    setErrors({ ...errors, [name]: "" });
  };

  // address change
  const handleAddressInput = (e) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value });
    setAddressErrors({ ...addressErrors, [name]: "" });
  };

  // validation
  const validate = () => {
    const err = {};
    const addrErr = {};

    // card validation
    if (paymentMethod === "card") {
      if (!formData.cardNumber) err.cardNumber = "Required";
      else if (formData.cardNumber.replace(/\s/g, "").length !== 16)
        err.cardNumber = "Enter valid 16-digit card";

      if (!formData.expiryDate) err.expiryDate = "Required";
      if (!formData.cvv) err.cvv = "Required";
      if (!formData.nameOnCard.trim()) err.nameOnCard = "Required";
    }

    // UPI validation
    if (paymentMethod === "upi") {
      if (!formData.upiId) err.upiId = "Enter UPI ID";
    }

    // address validation (for both)
    const required = ["fullName", "mobile", "house", "street", "city", "pincode", "state"];

    required.forEach((field) => {
      if (!address[field]) addrErr[field] = "Required";
    });

    if (address.mobile && !/^[6-9]\d{9}$/.test(address.mobile)) {
      addrErr.mobile = "Invalid mobile";
    }

    if (address.pincode && !/^\d{6}$/.test(address.pincode)) {
      addrErr.pincode = "Invalid pincode";
    }

    setErrors(err);
    setAddressErrors(addrErr);

    if (Object.keys(err).length > 0) return false;
    if (Object.keys(addrErr).length > 0) return false;

    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Fix errors before continuing.");
      return;
    }

    setLoading(true);

    try {
      const order = {
        userId: user.id,
        items: cartItems,
        totalAmount: getTotalPrice(), // No tax, no delivery
        paymentMethod,
        paymentStatus: "completed",
        address,
        date: new Date().toISOString(),
        status: "processing",
      };

      await fetch("http://localhost:3001/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      // clear server cart
      const r = await fetch(`http://localhost:3001/cart?userId=${user.id}`);
      const serverCart = await r.json();

      for (const it of serverCart) {
        await fetch(`http://localhost:3001/cart/${it.id}`, { method: "DELETE" });
      }

      localStorage.setItem("cart", JSON.stringify([]));

      toast.success("Order placed successfully!");

      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      toast.error("Payment failed!");
    }

    setLoading(false);
  };

  if (cartItems.length === 0)
    return <div className="p-10 text-center text-xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">Payment</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left */}
          <div className="bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-bold mb-4">Select Payment Method</h2>

            <div className="flex gap-3 mb-6">
              {[
                { id: "card", label: "Card", icon: "💳" },
                { id: "upi", label: "UPI", icon: "📱" },
              ].map((m) => (
                <button
                  key={m.id}
                  className={`flex-1 py-3 rounded-lg border ${
                    paymentMethod === m.id
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-300"
                  }`}
                  onClick={() => setPaymentMethod(m.id)}
                >
                  <div className="text-2xl">{m.icon}</div>
                  <p>{m.label}</p>
                </button>
              ))}
            </div>

            <form onSubmit={handlePayment}>

              {/* Card Payment */}
              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="Card Number"
                    maxLength="19"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      maxLength="5"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded"
                    />

                    <input
                      type="text"
                      name="cvv"
                      placeholder="CVV"
                      maxLength="4"
                      value={formData.cvv}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>

                  <input
                    type="text"
                    name="nameOnCard"
                    placeholder="Name on Card"
                    value={formData.nameOnCard}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
              )}

              {/* UPI */}
              {paymentMethod === "upi" && (
                <input
                  type="text"
                  name="upiId"
                  placeholder="yourname@upi"
                  value={formData.upiId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded mb-4"
                />
              )}

              {/* Delivery Address for BOTH */}
              <h2 className="text-lg font-bold mt-6 mb-2">Delivery Address</h2>

              {[
                { placeholder: "Full Name", name: "fullName" },
                { placeholder: "Mobile Number", name: "mobile" },
                { placeholder: "House / Building", name: "house" },
                { placeholder: "Street / Area", name: "street" },
                { placeholder: "City", name: "city" },
                { placeholder: "Pincode", name: "pincode" },
                { placeholder: "State", name: "state" },
              ].map((f) => (
                <input
                  key={f.name}
                  type="text"
                  name={f.name}
                  placeholder={f.placeholder}
                  value={address[f.name]}
                  onChange={handleAddressInput}
                  className="w-full px-4 py-2 border rounded mb-3"
                />
              ))}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg mt-4"
              >
                {loading ? "Processing..." : `Pay ₹${getTotalPrice()}`}
              </button>
            </form>
          </div>

          {/* Right */}
          <div className="bg-white p-6 rounded-xl shadow h-fit">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between mb-3">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p>₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}

            <hr className="my-4" />

            <p className="flex justify-between text-lg font-bold">
              Total:
              <span className="text-amber-600">
                ₹{getTotalPrice().toFixed(2)}
              </span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Payment;
