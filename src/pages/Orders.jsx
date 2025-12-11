import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaBox, FaCheckCircle, FaSpinner } from "react-icons/fa";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      toast.error("Please login to view your orders");
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `http://localhost:3002/orders?userId=${user.id}`
        );
        const data = await res.json();
        
        const validOrders = data.filter(order => 
          order && order.id && order.userId === user.id
        ).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        
        setOrders(validOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        toast.error("Failed to load orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const formatDate = (iso) => {
    try {
      if (!iso) return "Date not available";
      return new Date(iso).toLocaleString();
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
          <p className="text-rose-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50 p-8 flex flex-col items-center justify-center">
        <div className="max-w-md text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-6xl text-slate-400">📦</span>
          </div>
          <h2 className="text-4xl font-bold text-slate-800 mb-4">No Orders Yet</h2>
          <p className="text-slate-600 text-lg mb-8">
            Place your first order and it will show up here.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white 
            font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 
            transition-all duration-300 hover:shadow-lg shadow-md"
          >
            Browse Cakes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">My Orders</h1>
          <p className="text-slate-600">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
          </p>
          <div className="h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-full opacity-50 mt-4"></div>
        </div>

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 
              border border-slate-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status || "Pending"}</span>
                      </span>
                      <span className="text-slate-500 text-sm font-mono">
                        Order #{order.id}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-slate-600">
                        <span className="font-medium">Placed on:</span> {formatDate(order.date)}
                      </p>
                      <p className="text-slate-600">
                        <span className="font-medium">Payment:</span> {order.paymentMethod?.toUpperCase() || "N/A"} • 
                        <span className={
                          order.paymentStatus === "completed" 
                            ? " text-emerald-600 font-semibold ml-1" 
                            : " text-rose-600 font-semibold ml-1"
                        }>
                          {order.paymentStatus || "Pending"}
                        </span>
                      </p>
                      <p className="text-slate-600">
                        <span className="font-medium">Items:</span> {order.items?.length || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <p className="text-2xl font-bold text-emerald-600">
                      ₹{order.totalAmount?.toLocaleString("en-IN") || "0"}
                    </p>
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white 
                      rounded-lg font-medium hover:from-rose-600 hover:to-pink-600 
                      transition-all duration-300 flex items-center gap-2"
                    >
                      <span>View Details</span>
                    </button>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-slate-600 font-medium mb-3">Items in this order:</p>
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span className="text-sm text-slate-700">
                            {item.name} × {item.quantity || 1}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <span className="px-3 py-2 bg-slate-100 rounded-lg text-slate-600 text-sm">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Orders;