import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCreditCard, FaMobileAlt, FaArrowLeft } from "react-icons/fa";

function Payment() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    house: "",
    street: "",
    city: "",
    pincode: "",
    state: "",
  });

  const [errors, setErrors] = useState({});
  const [addressErrors, setAddressErrors] = useState({});

  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    upiId: "",
  });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) {
      toast.error("Please login");
      navigate("/login");
      return;
    }

    setUser(u);

    if (!u.id) return;

    fetch(`http://localhost:3002/users/${u.id}`)
      .then((res) => res.json())
      .then((data) => {
        const cart = data.cart || [];

        if (cart.length === 0) {
          toast.error("Your cart is empty!");
          navigate("/cart");
          return;
        }

        const formatted = cart.map((item) => ({
          id: Number(item.productId),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        }));

        setCartItems(formatted);

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
      .catch(() => toast.error("Failed to load checkout details"));
  }, []);

  const getTotalPrice = () =>
    cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleAddressInput = (e) => {
    const { name, value } = e.target;

    let v = value;
    if (name === "mobile") v = value.replace(/\D/g, "").slice(0, 10);
    if (name === "pincode") v = value.replace(/\D/g, "").slice(0, 6);

    setAddress({ ...address, [name]: v });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;

    if (name === "cardNumber") v = v.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
    if (name === "expiryDate") v = v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5);
    if (name === "cvv") v = v.replace(/\D/g, "").slice(0, 3);

    setFormData({ ...formData, [name]: v });
  };

  const validate = () => {
    let err = {};
    let addrErr = {};

    if (paymentMethod === "card") {
      if (formData.cardNumber.replace(/\s/g, "").length !== 16)
        err.cardNumber = "Invalid Card Number";

      if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate))
        err.expiryDate = "Invalid Date";

      if (formData.cvv.length !== 3)
        err.cvv = "Invalid CVV";

      if (!formData.nameOnCard.trim())
        err.nameOnCard = "Required";
    }

    if (paymentMethod === "upi") {
      if (!formData.upiId.includes("@"))
        err.upiId = "Invalid UPI ID";
    }

    // ADDRESS VALIDATIONS
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

  // -------------------- SAVE ADDRESS TO USER --------------------
  const saveAddressToUser = async () => {
    await fetch(`http://localhost:3002/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
  };

  // -------------------- PAYMENT SUBMIT --------------------
  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Fix errors before continuing");
      return;
    }

    setLoading(true);

    try {
      await saveAddressToUser();

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

      // CLEAR CART IN DATABASE
      await fetch(`http://localhost:3002/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: [] }),
      });

      toast.success("Order placed successfully!");
      navigate("/orders");

    } catch (error) {
      toast.error("Payment failed");
    }

    setLoading(false);
  };

  return (
    <div className="p-6">
      <button onClick={() => navigate("/cart")} className="flex items-center mb-4">
        <FaArrowLeft /> Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Secure Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">

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

          <div className="p-5 bg-white rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Delivery Address</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(address).map((key) => (
                <div key={key}>
                  <input
                    type="text"
                    name={key}
                    placeholder={key.toUpperCase()}
                    value={address[key]}
                    onChange={handleAddressInput}
                    className="p-3 border rounded-lg w-full"
                  />
                  {addressErrors[key] && (
                    <p className="text-red-500 text-sm">{addressErrors[key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

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
                <input className="w-full p-3 border mb-3" name="cardNumber" placeholder="Card Number"
                  value={formData.cardNumber} onChange={handleChange} />

                <input className="w-full p-3 border mb-3" name="expiryDate" placeholder="MM/YY"
                  value={formData.expiryDate} onChange={handleChange} />

                <input className="w-full p-3 border mb-3" name="cvv" placeholder="CVV"
                  value={formData.cvv} onChange={handleChange} />

                <input className="w-full p-3 border mb-3" name="nameOnCard" placeholder="Name on Card"
                  value={formData.nameOnCard} onChange={handleChange} />
              </>
            )}

            {paymentMethod === "upi" && (
              <input className="w-full p-3 border mb-3" name="upiId"
                placeholder="yourname@upi"
                value={formData.upiId}
                onChange={handleChange}
              />
            )}

            <button
              type="submit"
              className="w-full p-3 bg-emerald-500 text-white font-bold rounded-lg"
            >
              {loading ? "Processing..." : `Pay ₹${getTotalPrice()}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Payment;
