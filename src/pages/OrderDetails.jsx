import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

function OrderDetails() {
  const { id } = useParams(); // URL il ninn order id kittunnu
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

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
          throw new Error("Order not found");
        }
        const data = await res.json();

        if (data.userId !== user.id) {
          toast.error("You are not allowed to view this order");
          navigate("/orders");
          return;
        }

        setOrder(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load order details");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

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
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const addr = order.address || {};

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <button
          onClick={() => navigate("/orders")}
          className="mb-4 text-amber-600 hover:underline"
        >
          ← Back to Orders
        </button>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                Order #{order.id}
              </h1>
              <p className="text-gray-600">
                Placed on:{" "}
                <span className="font-medium">{formatDate(order.date)}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-amber-600">
                Total: ₹{order.totalAmount}
              </p>
              <p className="text-sm text-gray-600">
                Status:{" "}
                <span className="font-semibold text-green-600">
                  {order.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Ordered Items
          </h2>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div
                key={`${item.id}-${item.dbId}`}
                className="flex justify-between items-center border-b last:border-b-0 pb-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    ₹{item.price} x {item.quantity}
                  </p>
                  <p className="font-bold text-amber-600">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address + Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Delivery Address
            </h2>
            <p className="font-semibold text-gray-800">{addr.fullName}</p>
            <p className="text-gray-700">📞 {addr.mobile}</p>
            <p className="text-gray-700 mt-2">
              {addr.house}, {addr.street}
            </p>
            <p className="text-gray-700">
              {addr.city} - {addr.pincode}
            </p>
            <p className="text-gray-700">{addr.state}</p>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Payment Details
            </h2>
            <p className="text-gray-700">
              Method:{" "}
              <span className="font-semibold uppercase">
                {order.paymentMethod}
              </span>
            </p>
            <p className="text-gray-700 mt-2">
              Status:{" "}
              <span
                className={
                  order.paymentStatus === "completed"
                    ? "text-green-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {order.paymentStatus}
              </span>
            </p>
            <p className="text-gray-700 mt-2">
              Order Status:{" "}
              <span className="font-semibold text-amber-600">
                {order.status}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
