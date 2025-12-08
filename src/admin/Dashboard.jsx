import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { 
  FaUsers, FaBox, FaShoppingCart, FaRupeeSign, FaEye,
  FaHome, FaSignOutAlt, FaBars, FaTimes, FaPlus,
  FaEdit, FaTachometerAlt, FaArrowLeft
} from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          axios.get("http://localhost:3002/users"),
          axios.get("http://localhost:3002/products"),
          axios.get("http://localhost:3002/orders"),
        ]);

        const users = usersRes.data || [];
        const products = productsRes.data || [];
        const orders = ordersRes.data || [];
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        const userMap = {};
        users.forEach((u) => {
          userMap[u.id] = u.username || u.email || u.id;
        });

        const sortedOrders = [...orders].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        const latest = sortedOrders.slice(0, 5).map((o) => ({
          id: o.id,
          userName: userMap[o.userId] || `User ${o.userId}`,
          totalAmount: o.totalAmount,
          status: o.status,
          date: o.date,
        }));

        setStats({
          totalUsers: users.length,
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue,
        });
        setRecentOrders(latest);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "delivered":
        return "bg-emerald-100 text-emerald-800";
      case "processing":
        return "bg-amber-100 text-amber-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statCards = [
    { 
      title: "Total Users", 
      value: stats.totalUsers, 
      icon: <FaUsers />, 
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    { 
      title: "Total Products", 
      value: stats.totalProducts, 
      icon: <FaBox />, 
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700"
    },
    { 
      title: "Total Orders", 
      value: stats.totalOrders, 
      icon: <FaShoppingCart />, 
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
    { 
      title: "Total Revenue", 
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, 
      icon: <FaRupeeSign />, 
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700"
    },
  ];

  const menuItems = [
    { 
      path: "/admin", 
      label: "Dashboard", 
      icon: <FaHome />,
      active: true
    },
    { 
      path: "/admin/products", 
      label: "Products", 
      icon: <FaBox />
    },
    { 
      path: "/admin/orders", 
      label: "Orders", 
      icon: <FaShoppingCart />
    },
    { 
      path: "/admin/users", 
      label: "Users", 
      icon: <FaUsers />
    },
  ];

  const logoutAdmin = () => {
    localStorage.removeItem("admin");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9F8F6] to-[#EFE9E3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C9B59C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5D4737] font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F8F6] to-[#EFE9E3]">
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen bg-white border-r border-[#D9CFC7] 
        shadow-xl z-40 transition-all duration-300
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo & Header */}
        <div className="p-6 border-b border-[#EFE9E3]">
          <div className="flex items-center justify-between">
            {isSidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] flex items-center justify-center text-white font-bold">
                  <FaTachometerAlt />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#5D4737]">Admin Panel</h1>
                  <p className="text-xs text-[#8B7355]">Dashboard</p>
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

        {/* Navigation */}
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

          {/* Quick Actions */}
          {isSidebarOpen && (
            <div className="mt-6 pt-6 border-t border-[#EFE9E3]">
              <h3 className="text-sm font-semibold text-[#8B7355] mb-3 px-3">Quick Actions</h3>
              <button
                onClick={() => {
                  navigate("/admin/products/add");
                  if (window.innerWidth < 1024) setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:shadow-md transition-all"
              >
                <FaPlus />
                <span>Add Product</span>
              </button>
            </div>
          )}
        </nav>

        {/* Logout & User Info */}
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

      {/* Main Content - NO TOP PADDING, starts at top */}
      <main className={`
        transition-all duration-300 min-h-screen
        ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
      `}>
        {/* Hero Section - Directly at top */}
        <div className="bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
                <p className="text-white/90">Manage your store efficiently with real-time analytics</p>
              </div>
              <div className="mt-4 lg:mt-0 flex gap-3">
                <button
                  onClick={() => navigate("/admin/orders")}
                  className="px-5 py-2.5 bg-white text-[#5D4737] font-semibold rounded-lg hover:shadow-xl transition-all"
                >
                  View Orders
                </button>
                <button
                  onClick={() => navigate("/admin/products/add")}
                  className="px-5 py-2.5 bg-black/20 text-white font-semibold rounded-lg border-2 border-white hover:bg-white/10 transition-all"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Reduced margin */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md border border-[#D9CFC7] p-5 transform hover:-translate-y-1 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} text-white shadow-sm`}>
                    {stat.icon}
                  </div>
                  <span className="text-2xl font-bold text-[#5D4737]">{stat.value}</span>
                </div>
                <h3 className={`font-semibold ${stat.textColor}`}>{stat.title}</h3>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#5D4737]">Recent Orders</h2>
              <button
                onClick={() => navigate("/admin/orders")}
                className="flex items-center gap-2 text-[#C9B59C] hover:text-[#B8A48B] font-semibold"
              >
                <span>View All</span>
                <FaEye />
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-md border border-[#D9CFC7] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F9F8F6]">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-[#5D4737]">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#5D4737]">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#5D4737]">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#5D4737]">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#5D4737]">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE9E3]">
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-[#8B7355]">
                          No orders found
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr 
                          key={order.id} 
                          className="hover:bg-[#F9F8F6] transition-colors cursor-pointer"
                          onClick={() => navigate(`/admin/orders`)}
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm font-bold text-[#5D4737]">
                              #{order.id.toString().slice(-6)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-medium text-[#5D4737]">{order.userName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-emerald-600">
                              ₹{order.totalAmount?.toLocaleString("en-IN")}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                              {order.status || "pending"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-[#8B7355]">
                              {formatDate(order.date)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;