import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft, FaCheckCircle, FaSpinner, FaBox, FaCreditCard, FaMapMarkerAlt, FaUser } from "react-icons/fa";

function OrderDetails() {
  const { id } = useParams(); 
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      toast.error("Please login to view order details");
      navigate("/login");
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:3002/orders/${id}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Order not found");
          }
          throw new Error("Failed to fetch order");
        }
        
        const data = await res.json();

        if (!data) {
          throw new Error("Order data is empty");
        }

        if (data.userId && data.userId !== user.id) {
          toast.error("You are not allowed to view this order");
          navigate("/orders");
          return;
        }

        if (!data.items) {
          data.items = [];
        }

        if (!data.address) {
          data.address = {
            fullName: "Not available",
            mobile: "Not available",
            house: "Not available",
            street: "Not available",
            city: "Not available",
            pincode: "Not available",
            state: "Not available"
          };
        }

        setOrder(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.message);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const formatDate = (iso) => {
    try {
      if (!iso) return "Date not available";
      return new Date(iso).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "success":
        return <FaCheckCircle className="text-emerald-500" />;
      case "processing":
        return <FaSpinner className="animate-spin text-blue-500" />;
      default:
        return <FaBox className="text-amber-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "success":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mb-4"></div>
          <p className="text-rose-600 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 p-8 flex flex-col items-center justify-center">
        <div className="max-w-md text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-6xl text-rose-400">❌</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Order Not Found</h2>
          <p className="text-slate-600 text-lg mb-2">
            {error || "The order you're looking for doesn't exist."}
          </p>
          <p className="text-slate-500 mb-8">Order ID: #{id}</p>
          <button
            onClick={() => navigate("/orders")}
            className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white 
            font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 
            transition-all duration-300 hover:shadow-lg shadow-md"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const addr = order.address || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        
        <div className="mb-8">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-lg transition-all duration-300 mb-6"
          >
            <FaArrowLeft />
            Back to Orders
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`px-4 py-2 rounded-full text-lg font-medium border flex items-center gap-3 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status || "Pending"}</span>
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                      Order #{order.id}
                    </h1>
                    <p className="text-slate-600">
                      Placed on {formatDate(order.date)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-600">
                  ₹{order.totalAmount?.toLocaleString("en-IN") || "0"}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  {order.items?.length || 0} items
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <FaBox className="text-white" />
                </div>
                Ordered Items
              </h2>
              
              {order.items && order.items.length > 0 ? (
                <div className="space-y-6">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <img
                        src={item.image}
                        alt={item.name || `Item ${index + 1}`}
                        className="w-20 h-20 rounded-lg object-cover border border-slate-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/80?text=Cake";
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 mb-1">
                          {item.name || `Item ${index + 1}`}
                        </p>
                        <p className="text-sm text-slate-500">
                          Quantity: {item.quantity || 1}
                        </p>
                        {item.price && (
                          <p className="text-sm text-slate-500">
                            Price: ₹{item.price}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800 text-lg">
                          ₹{(item.price || 0) * (item.quantity || 1)}
                        </p>
                        {item.price && (
                          <p className="text-slate-500 text-sm">
                            ₹{item.price} × {item.quantity || 1}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">No items found in this order</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">💰</span>
                </div>
                Order Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold text-slate-800">
                    ₹{order.totalAmount?.toLocaleString("en-IN") || "0"}
                  </span>
                </div>
                
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Delivery</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                
                <div className="flex justify-between py-4 border-t border-slate-200">
                  <span className="text-xl font-bold text-slate-800">Total Amount</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    ₹{order.totalAmount?.toLocaleString("en-IN") || "0"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <FaMapMarkerAlt className="text-white" />
                </div>
                Delivery Address
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FaUser className="text-slate-400 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-800">{addr.fullName}</p>
                    <p className="text-slate-600">{addr.mobile}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-slate-700">{addr.house}</p>
                  <p className="text-slate-700">{addr.street}</p>
                  <p className="text-slate-700">
                    {addr.city} - {addr.pincode}
                  </p>
                  <p className="text-slate-700">{addr.state}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <FaCreditCard className="text-white" />
                </div>
                Payment Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Method</p>
                  <p className="font-semibold text-slate-800 uppercase">
                    {order.paymentMethod || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm font-medium">Status</p>
                  <p className={
                    order.paymentStatus === "completed"
                      ? "text-emerald-600 font-semibold"
                      : "text-amber-600 font-semibold"
                  }>
                    {order.paymentStatus || "Pending"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4">Order Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-slate-600 text-sm">Order ID</p>
                  <p className="font-mono text-slate-800">{order.id}</p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Order Date</p>
                  <p className="text-slate-800">{formatDate(order.date)}</p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Customer ID</p>
                  <p className="font-mono text-slate-800">{order.userId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;