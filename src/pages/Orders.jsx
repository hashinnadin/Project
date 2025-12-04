import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
        setOrders(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-amber-600 text-xl">
        Loading your orders...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
        <div className="text-5xl mb-4">📦</div>
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-gray-600 mb-6">
          Place your first order and it will show up here.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium"
        >
          Browse Cakes
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          My Orders ({orders.length})
        </h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row justify-between gap-4"
            >
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Order ID: <span className="font-mono">{order.id}</span>
                </p>
                <p className="text-gray-700">
                  Placed on:{" "}
                  <span className="font-medium">{formatDate(order.date)}</span>
                </p>
                <p className="text-gray-700">
                  Payment:{" "}
                  <span className="font-semibold uppercase">
                    {order.paymentMethod}
                  </span>{" "}
                  (
                  <span
                    className={
                      order.paymentStatus === "completed"
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {order.paymentStatus}
                  </span>
                  )
                </p>
                <p className="text-gray-700">
                  Status:{" "}
                  <span className="font-semibold text-amber-600">
                    {order.status}
                  </span>
                </p>
                <p className="text-gray-700">
                  Items:{" "}
                  <span className="font-semibold">
                    {order.items?.length || 0}
                  </span>
                </p>
              </div>

              <div className="flex flex-col items-end justify-between gap-3">
                <p className="text-xl font-bold text-amber-600">
                  ₹{order.totalAmount}
                </p>
                <button
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Orders;
