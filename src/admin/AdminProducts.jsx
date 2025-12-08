import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  FaPlus, FaEdit, FaTrash, FaSearch, FaBox, FaHome,
  FaShoppingCart, FaUsers, FaSignOutAlt, FaBars, FaTimes, FaTachometerAlt
} from "react-icons/fa";

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const loadProducts = async () => {
    try {
      const res = await fetch("http://localhost:3002/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast.error("Failed to load products!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`http://localhost:3002/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Product deleted successfully!");
      loadProducts();
    } catch (error) {
      toast.error("Error deleting product!");
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
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
      icon: <FaBox />,
      active: true
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9F8F6] to-[#EFE9E3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#C9B59C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5D4737]">Loading products...</p>
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
                  <p className="text-xs text-[#8B7355]">Products</p>
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
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Product Management</h1>
                <p className="text-white/90 text-sm">Manage your product catalog</p>
              </div>
              <button
                onClick={() => navigate("/admin/products/add")}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#5D4737] font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                <FaPlus />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8B7355]" />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#D9CFC7] bg-white text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C]"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-3 text-center py-8">
                <div className="text-[#8B7355]">
                  <FaBox className="text-5xl mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No products found</p>
                  <p className="text-sm">Try adjusting your search or add a new product</p>
                </div>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-md border border-[#D9CFC7] overflow-hidden hover:shadow-lg transition-all">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-[#5D4737] truncate">{product.name}</h3>
                      <span className="font-semibold text-emerald-600">₹{product.price}</span>
                    </div>
                    <p className="text-sm text-[#8B7355] mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="px-3 py-1 bg-[#EFE9E3] text-[#5D4737] rounded-full text-sm">
                        {product.category}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                          className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
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

export default AdminProducts;