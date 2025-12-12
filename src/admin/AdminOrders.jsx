import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  FaTruck, FaCheckCircle, FaTimesCircle, FaSearch,
  FaHome, FaBox, FaShoppingCart, FaUsers, FaSignOutAlt, 
  FaBars, FaTimes, FaTachometerAlt
} from "react-icons/fa";

function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const loadOrders = async () => {
    try {
      const res = await fetch("http://localhost:3002/orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      toast.error("Failed to load orders!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await fetch(`http://localhost:3002/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success("Order status updated!");
      loadOrders();
    } catch (error) {
      toast.error("Failed to update status!");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "success": return "bg-emerald-100 text-emerald-800";
      case "processing": return "bg-amber-100 text-amber-800";
      case "canceled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem("admin");
    navigate("/login");
  };

  const menuItems = [
    { 
      path: "/admin", 
      label: "Dashboard", 
      icon: <FaHome />
    },
    { 
      path: "/admin/products", 
      label: "Products", 
      icon: <FaBox />
    },
    { 
      path: "/admin/orders", 
      label: "Orders", 
      icon: <FaShoppingCart />,
      active: true
    },
    { 
      path: "/admin/users", 
      label: "Users", 
      icon: <FaUsers />
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9F8F6] to-[#EFE9E3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#C9B59C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5D4737]">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F8F6] to-[#EFE9E3]">
      <aside className={`
        fixed top-0 left-0 h-screen bg-white border-r border-[#D9CFC7] 
        shadow-xl z-40 transition-all duration-300
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-[#EFE9E3]">
          <div className="flex items-center justify-between">
            {isSidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] flex items-center justify-center text-white font-bold">
                  <FaTachometerAlt />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#5D4737]">Admin Panel</h1>
                  <p className="text-xs text-[#8B7355]">Orders</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] flex items-center justify-center text-white font-bold mx-auto">
                <FaTachometerAlt />
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:block text-[#8B7355] hover:text-[#C9B59C]"
            >
              {isSidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-180px)]">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (window.innerWidth < 1024) setIsMobileMenuOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                ${window.location.pathname === item.path
                  ? "bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] text-white shadow-md"
                  : "text-[#5D4737] hover:bg-[#F9F8F6] hover:shadow-sm"
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#EFE9E3] bg-white">
          <button
            onClick={logoutAdmin}
            className="w-full flex items-center justify-center gap-3 p-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:shadow-md transition-all"
          >
            <FaSignOutAlt />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 text-2xl text-[#5D4737] bg-white p-2 rounded-lg shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`
        transition-all duration-300 min-h-screen
        ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#5D4737]">Order Management</h1>
            <p className="text-[#8B7355] mt-1">Manage customer orders and status</p>
            
            <div className="relative max-w-md mt-4">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8B7355]" />
              <input
                type="text"
                placeholder="Search by Order ID or User ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#D9CFC7] bg-white text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-[#8B7355]">No orders found</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-md border border-[#D9CFC7] p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-[#5D4737]">Order #{order.id}</h3>
                      <p className="text-sm text-[#8B7355]">User ID: {order.userId}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="font-semibold text-emerald-600 text-lg">
                      ₹{order.totalAmount?.toLocaleString("en-IN")}
                    </p>
                    <p className="text-sm text-[#8B7355] capitalize">{order.paymentMethod}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => updateStatus(order.id, "processing")}
                      className="flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100"
                    >
                      <FaTruck />
                      Processing
                    </button>
                    <button
                      onClick={() => updateStatus(order.id, "Success")}
                      className="flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    >
                      <FaCheckCircle />
                      Complete
                    </button>
                    <button
                      onClick={() => updateStatus(order.id, "Canceled")}
                      className="flex items-center justify-center gap-2 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      <FaTimesCircle />
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminOrders;