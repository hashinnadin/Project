import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaBan, FaCheck, FaSearch, FaUser, FaHome, FaBox, FaShoppingCart, FaUsers, FaSignOutAlt, FaBars, FaTimes, FaTachometerAlt, FaLock, FaUnlock } from "react-icons/fa";

function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const loadUsers = async () => {
    try {
      const res = await fetch("http://localhost:3002/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load users!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleUserStatus = async (id, currentStatus) => {
    const action = currentStatus === "active" ? "block" : "unblock";
    const confirmMessage = currentStatus === "active" 
      ? "Are you sure you want to block this user?" 
      : "Are you sure you want to unblock this user?";

    if (!window.confirm(confirmMessage)) return;
    
    try {
      const res = await fetch(`http://localhost:3002/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: currentStatus === "active" ? "blocked" : "active"
        }),
      });
      
      if (!res.ok) throw new Error("Unable to update user status");
      
      toast.success(`User ${action}ed successfully`);
      loadUsers();
    } catch (err) {
      toast.error(`Error ${action}ing user!`);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      icon: <FaShoppingCart />
    },
    { 
      path: "/admin/users", 
      label: "Users", 
      icon: <FaUsers />,
      active: true
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9F8F6] to-[#EFE9E3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#C9B59C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5D4737]">Loading users...</p>
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
                  <p className="text-xs text-[#8B7355]">Users</p>
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
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#5D4737]">User Management</h1>
              <p className="text-[#8B7355] mt-1">Manage registered users</p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8B7355]" />
              <input
                type="text"
                placeholder="Search users by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#D9CFC7] bg-white text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-[#D9CFC7] shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B7355]">Total Users</p>
                  <p className="text-2xl font-bold text-[#5D4737]">{users.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <FaUsers className="text-blue-500 text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-[#D9CFC7] shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B7355]">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.status === "active" || !u.status).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                  <FaCheck className="text-green-500 text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-[#D9CFC7] shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#8B7355]">Blocked Users</p>
                  <p className="text-2xl font-bold text-red-600">
                    {users.filter(u => u.status === "blocked").length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                  <FaBan className="text-red-500 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-[#D9CFC7] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9F8F6]">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-medium text-[#5D4737]">User</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-[#5D4737]">Username</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-[#5D4737]">Email</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-[#5D4737]">Password</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-[#5D4737]">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-[#5D4737]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9E3]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-[#8B7355]">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-[#F9F8F6] transition-colors">
                        <td className="py-4 px-6">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] flex items-center justify-center text-white font-bold">
                            <FaUser />
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-[#5D4737]">{user.username}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-[#5D4737]">{user.email}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-mono text-sm text-[#8B7355] bg-[#F9F8F6] px-2 py-1 rounded">
                            {user.password}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`
                            inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                            ${(user.status === "active" || !user.status) 
                              ? "bg-green-50 text-green-700" 
                              : "bg-red-50 text-red-700"
                            }
                          `}>
                            {(user.status === "active" || !user.status) ? (
                              <>
                                <FaCheck /> Active
                              </>
                            ) : (
                              <>
                                <FaBan /> Blocked
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => toggleUserStatus(user.id, user.status || "active")}
                            className={`
                              flex items-center gap-2 px-4 py-2 rounded-lg font-medium 
                              hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200
                              ${(user.status === "active" || !user.status)
                                ? "bg-gradient-to-r from-red-400 to-red-500 text-white"
                                : "bg-gradient-to-r from-green-400 to-green-500 text-white"
                              }
                            `}
                          >
                            {(user.status === "active" || !user.status) ? (
                              <>
                                <FaLock />
                                Block User
                              </>
                            ) : (
                              <>
                                <FaUnlock />
                                Unblock User
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminUsers;