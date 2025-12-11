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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length !== 0) {
      setLoading(false);
      return;
    }

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
      setLoading(false);
      return;
    }

    try {
      const blockedCheck = await axios.get(
        `http://localhost:3002/users?email=${form.email}&status=blocked`
      );

      if (blockedCheck.data.length > 0) {
        toast.error("Your account has been blocked. Please contact support.");
        setLoading(false);
        return;
      }

      const res = await axios.get(
        `http://localhost:3002/users?email=${form.email}&password=${form.password}&status=active`
      );

      if (res.data.length === 0) {
        const fallbackRes = await axios.get(
          `http://localhost:3002/users?email=${form.email}&password=${form.password}`
        );
        
        if (fallbackRes.data.length === 0) {
          toast.error("Invalid email or password");
          setLoading(false);
          return;
        }
        
        const userData = { ...fallbackRes.data[0], status: "active" };
        localStorage.setItem("user", JSON.stringify(userData));
        
        try {
          await axios.patch(`http://localhost:3002/users/${userData.id}`, {
            status: "active"
          });
        } catch (updateError) {
          console.log("Could not update user status, but login continues");
        }
        
        toast.success("Login Successful!");
        navigate("/");
        setLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(res.data[0]));
      
      localStorage.removeItem("admin");
      
      toast.success("Login Successful!");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Server error!");
    } finally {
      setLoading(false);
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
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-[#D9CFC7] bg-[#F9F8F6] text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:border-transparent transition-all duration-200 disabled:opacity-60"
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
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-[#D9CFC7] bg-[#F9F8F6] text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:border-transparent transition-all duration-200 disabled:opacity-60"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1 ml-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="text-center text-xs text-[#8B7355] bg-[#F9F8F6] p-3 rounded-lg border border-[#EFE9E3]">
            <p className="font-medium mb-1">Admin Login:</p>
            <p>Email: admin@gmail.com</p>
            <p>Password: admin123</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[#EFE9E3]">
          <p className="text-sm text-[#8B7355] text-center">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              disabled={loading}
              className="text-[#C9B59C] hover:text-[#B8A48B] font-medium transition-colors disabled:opacity-60"
            >
              Create Account
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
export default Login;

