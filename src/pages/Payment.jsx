import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCreditCard, FaMobileAlt, FaTruck, FaLock, FaCheck, FaArrowLeft } from "react-icons/fa";

function Payment() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(null);

  // 🆕 USER ADDRESS STATE
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
  const [errors, setErrors] = useState({});

  // PAYMENT INPUTS
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    upiId: "",
  });

  // 🆕 Load user details + previous address
 useEffect(() => {
  const u = JSON.parse(localStorage.getItem("user"));

  if (!u) {
    toast.error("Please login to continue");
    navigate("/login");
    return;
  }

  setUser(u);

  // LOAD USER CART FROM DATABASE
  fetch(`http://localhost:3002/users/${u.id}`)
    .then((res) => res.json())
    .then((data) => {
      const cart = data.cart || [];

      if (cart.length === 0) {
        toast.error("Your cart is empty!");
        navigate("/cart");
        return;
      }

      // format cart items
      const formatted = cart.map((item) => ({
        id: Number(item.productId),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      setCartItems(formatted);

      // LOAD ADDRESS IF EXISTS
      if (data.address) {
        setAddress({
          fullName: data.address.fullName || "",
          mobile: data.address.mobile || "",
          house: data.address.house || "",
          street: data.address.street || "",
          city: data.address.city || "",
          pincode: data.address.pincode || "",
          state: data.address.state || "",
        });
      }
    })
    .catch(() => {
      toast.error("Failed to load your details");
    });
}, []);


  // Calculate Total Price
  const getTotalPrice = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Handle Payment Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;

    if (name === "cardNumber") v = v.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
    if (name === "expiryDate") v = v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5);
    if (name === "cvv") v = v.replace(/\D/g, "").slice(0, 3);

    setFormData({ ...formData, [name]: v });
    setErrors({ ...errors, [name]: "" });
  };

  // Address Input Handler
  const handleAddressInput = (e) => {
    const { name, value } = e.target;

    let v = value;
    if (name === "mobile") v = v.replace(/\D/g, "").slice(0, 10);
    if (name === "pincode") v = v.replace(/\D/g, "").slice(0, 6);

    setAddress({ ...address, [name]: v });
    setAddressErrors({ ...addressErrors, [name]: "" });
  };

  // VALIDATE
  const validate = () => {
    let err = {};
    let addrErr = {};

    if (paymentMethod === "card") {
      if (formData.cardNumber.replace(/\s/g, "").length !== 16)
        err.cardNumber = "Invalid Card Number";
      if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate))
        err.expiryDate = "Invalid Date";
      if (formData.cvv.length !== 3) err.cvv = "Invalid CVV";
      if (!formData.nameOnCard.trim()) err.nameOnCard = "Name required";
    }

    if (paymentMethod === "upi") {
      if (!formData.upiId.includes("@")) err.upiId = "Invalid UPI ID";
    }

    // Address Validation
    if (!address.fullName.trim()) addrErr.fullName = "Required";
    if (address.mobile.length !== 10) addrErr.mobile = "Invalid mobile";
    if (!address.house.trim()) addrErr.house = "Required";
    if (!address.street.trim()) addrErr.street = "Required";
    if (!address.city.trim()) addrErr.city = "Required";
    if (address.pincode.length !== 6) addrErr.pincode = "Invalid pincode";
    if (!address.state.trim()) addrErr.state = "Required";

    setErrors(err);
    setAddressErrors(addrErr);

    return Object.keys(err).length === 0 && Object.keys(addrErr).length === 0;
  };

  // 🆕 SAVE ADDRESS TO USER PROFILE
  const saveAddressToUser = async () => {
    await fetch(`http://localhost:3002/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
  };

  // HANDLE PAYMENT
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Fix errors before continuing");
      return;
    }

    setLoading(true);

    try {
      // 🆕 Save Address to User Profile
      await saveAddressToUser();

      // Create Order
      const order = {
        userId: user.id,
        items: cartItems,
        totalAmount: getTotalPrice(),
        paymentMethod,
        paymentStatus: "completed",
        address,
        date: new Date().toISOString(),
        status: "Success",
      };

      await fetch("http://localhost:3002/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      // Clear cart
      localStorage.setItem("cart", JSON.stringify([]));

      toast.success("Order Placed Successfully!");

      setTimeout(() => navigate("/orders"), 1500);
    } catch (error) {
      toast.error("Payment Failed!");
    } finally {
      setLoading(false);
    }
  };

  const addressFields = [
    { name: "fullName", placeholder: "Full Name" },
    { name: "mobile", placeholder: "Mobile Number" },
    { name: "house", placeholder: "House / Building" },
    { name: "street", placeholder: "Street / Area" },
    { name: "city", placeholder: "City" },
    { name: "pincode", placeholder: "Pincode" },
    { name: "state", placeholder: "State" },
  ];

  return (
    <div className="min-h-screen p-6">
      <button onClick={() => navigate("/cart")} className="mb-4 flex items-center">
        <FaArrowLeft /> Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Secure Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SIDE: ADDRESS + SUMMARY */}
        <div className="lg:col-span-2 space-y-6">

          {/* ORDER SUMMARY */}
          <div className="p-5 bg-white rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between p-3 border-b">
                <span>{item.name} × {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}

            <div className="text-xl font-bold mt-4">
              Total: ₹{getTotalPrice()}
            </div>
          </div>

          {/* ADDRESS */}
          <div className="p-5 bg-white rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Delivery Address</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addressFields.map((f) => (
                <input
                  key={f.name}
                  type="text"
                  name={f.name}
                  value={address[f.name]}
                  onChange={handleAddressInput}
                  placeholder={f.placeholder}
                  className="p-3 border rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: PAYMENT */}
        <div className="p-5 bg-white rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Payment Method</h2>

          <button
            className={`w-full p-3 mb-3 rounded-lg border ${paymentMethod === "card" ? "bg-blue-100" : ""}`}
            onClick={() => setPaymentMethod("card")}
          >
            <FaCreditCard /> Card Payment
          </button>

          <button
            className={`w-full p-3 mb-3 rounded-lg border ${paymentMethod === "upi" ? "bg-purple-100" : ""}`}
            onClick={() => setPaymentMethod("upi")}
          >
            <FaMobileAlt /> UPI Payment
          </button>

          <form onSubmit={handlePayment}>
            {paymentMethod === "card" && (
              <>
                <input className="w-full p-3 mb-3 border" name="cardNumber" placeholder="Card Number" value={formData.cardNumber} onChange={handleChange} />
                <input className="w-full p-3 mb-3 border" name="expiryDate" placeholder="MM/YY" value={formData.expiryDate} onChange={handleChange} />
                <input className="w-full p-3 mb-3 border" name="cvv" placeholder="CVV" value={formData.cvv} onChange={handleChange} />
                <input className="w-full p-3 mb-3 border" name="nameOnCard" placeholder="Name on Card" value={formData.nameOnCard} onChange={handleChange} />
              </>
            )}

            {paymentMethod === "upi" && (
              <input className="w-full p-3 mb-3 border" name="upiId" placeholder="yourname@upi" value={formData.upiId} onChange={handleChange} />
            )}

            <button type="submit" className="w-full p-3 bg-emerald-500 text-white font-bold rounded-lg mt-4">
              {loading ? "Processing..." : `Pay ₹${getTotalPrice()}`}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default Payment;
