import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  FaArrowLeft, FaSave, FaHome, FaBox, FaShoppingCart, 
  FaUsers, FaSignOutAlt, FaBars, FaTimes, FaPlus,
  FaTachometerAlt
} from "react-icons/fa";

function AdminAddProducts() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: "",
  });
  const [errors, setErrors] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErr = {};
    if (!form.name.trim()) newErr.name = "Product name is required";
    if (!form.price || form.price <= 0) newErr.price = "Valid price is required";
    if (!form.category.trim()) newErr.category = "Category is required";
    if (!form.image.trim()) newErr.image = "Image URL is required";
    if (!form.description.trim()) newErr.description = "Description is required";
    return newErr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const newProduct = {
      id: String(Date.now()),
      name: form.name,
      price: Number(form.price),
      category: form.category,
      description: form.description,
      image: form.image,
      rating: 4.5,
    };

    try {
      const res = await fetch("http://localhost:3002/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      if (!res.ok) throw new Error("Failed to add product!");
      toast.success("Product added successfully!");
      navigate("/admin/products");
    } catch (error) {
      toast.error("Error adding product");
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
                  <p className="text-xs text-[#8B7355]">Add Product</p>
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

          {isSidebarOpen && (
            <div className="mt-6 pt-6 border-t border-[#EFE9E3]">
              <h3 className="text-sm font-semibold text-[#8B7355] mb-3 px-3">Quick Actions</h3>
              <button
                onClick={() => {
                  navigate("/admin/products");
                  if (window.innerWidth < 1024) setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:shadow-md transition-all"
              >
                <FaArrowLeft />
                <span>View Products</span>
              </button>
            </div>
          )}
        </nav>

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

      <button
        className="lg:hidden fixed top-4 left-4 z-50 text-2xl text-[#5D4737] bg-white p-2 rounded-lg shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

       {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className={`
        transition-all duration-300 min-h-screen
        ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
      `}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <button
              onClick={() => navigate("/admin/products")}
              className="flex items-center gap-2 text-[#5D4737] hover:text-[#C9B59C] mb-4 transition-colors"
            >
              <FaArrowLeft />
              <span>Back to Products</span>
            </button>
            <div className="bg-white rounded-xl shadow-sm border border-[#D9CFC7] p-6">
              <h1 className="text-3xl font-bold text-[#5D4737] mb-2">Add New Product</h1>
              <p className="text-[#8B7355]">Fill in the details to add a new product</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[#D9CFC7] overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#5D4737] mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-[#D9CFC7] bg-[#F9F8F6] text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:border-transparent transition-all duration-200"
                    placeholder="Enter product name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5D4737] mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-[#D9CFC7] bg-[#F9F8F6] text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:border-transparent transition-all duration-200"
                    placeholder="Enter price"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5D4737] mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-[#D9CFC7] bg-[#F9F8F6] text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:border-transparent transition-all duration-200"
                    placeholder="Eg: Premium, Classic, Fruit..."
                  />
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5D4737] mb-2">
                    Image URL *
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-[#D9CFC7] bg-[#F9F8F6] text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:border-transparent transition-all duration-200"
                    placeholder="/cake/cake1.avif"
                  />
                  {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5D4737] mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-[#D9CFC7] bg-[#F9F8F6] text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:border-transparent transition-all duration-200"
                  rows="4"
                  placeholder="Enter product description"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/admin/products")}
                  className="px-6 py-3 rounded-lg border border-[#D9CFC7] text-[#5D4737] font-medium hover:bg-[#F9F8F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] text-white font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <FaSave />
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminAddProducts;