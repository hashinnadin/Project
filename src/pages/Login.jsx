import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!form.email.trim()) newErrors.email = "Email required";
    if (!form.password.trim()) newErrors.password = "Password required";

    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length !== 0) return;

    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_PASSWORD = "admin123";

    if (form.email === ADMIN_EMAIL && form.password === ADMIN_PASSWORD) {
      localStorage.setItem(
        "admin",
        JSON.stringify({ email: ADMIN_EMAIL, role: "admin" })
      );
      
      localStorage.removeItem("user");
      
      toast.success("Admin login successful!");
      navigate("/admin"); 
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:3002/users?email=${form.email}&password=${form.password}`
      );

      if (res.data.length === 0) {
        toast.error("Invalid email or password");
        return;
      }
      
      // Save user session
      localStorage.setItem("user", JSON.stringify(res.data[0]));
      
      // Clear any existing admin session
      localStorage.removeItem("admin");
      
      toast.success("Login Successful!");
      navigate("/"); 
    } catch (error) {
      console.error(error);
      toast.error("Server error!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9F8F6] to-[#EFE9E3]">
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      
      <form
        onSubmit={handleLogin}
        className="relative w-full max-w-md p-8 rounded-2xl shadow-xl bg-white border border-[#D9CFC7]"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#C9B59C] to-[#D9CFC7] flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-2xl font-bold text-white">👤</span>
          </div>
          <h2 className="text-3xl font-bold text-[#5D4737]">Welcome Back</h2>
          <p className="text-[#8B7355] mt-2">Sign in to your account</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#5D4737] mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-[#D9CFC7] bg-[#F9F8F6] text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:border-transparent transition-all duration-200"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1 ml-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5D4737] mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-[#D9CFC7] bg-[#F9F8F6] text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:border-transparent transition-all duration-200"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1 ml-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:ring-offset-2"
          >
            Sign In
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-[#EFE9E3]">
          <p className="text-sm text-[#8B7355] text-center">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-[#C9B59C] hover:text-[#B8A48B] font-medium transition-colors"
            >
              Create Account
            </button>
          </p>
          
        
          <p className="text-xs text-center text-[#C9B59C] mt-4">
    
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;