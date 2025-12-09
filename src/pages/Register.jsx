import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (!form.username.trim()) newErrors.username = "Username is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }

    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length !== 0) {
      setLoading(false);
      return;
    }

    try {
      // Check if email already exists
      const userCheck = await axios.get(
        `http://localhost:3002/users?email=${form.email}`
      );
      
      if (userCheck.data.length > 0) {
        toast.error("Email already registered!");
        setLoading(false);
        return;
      }

      // Register new user with active status
      await axios.post("http://localhost:3002/users", {
        username: form.username,
        email: form.email,
        password: form.password,
        status: "active", // Default status for new users
        createdAt: new Date().toISOString()
      });

      toast.success("Registration Successful!");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9F8F6] to-[#EFE9E3]">
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md p-8 rounded-2xl shadow-xl bg-white border border-[#D9CFC7]"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#C9B59C] to-[#D9CFC7] flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-2xl font-bold text-white">📝</span>
          </div>
          <h2 className="text-3xl font-bold text-[#5D4737]">Create Account</h2>
          <p className="text-[#8B7355] mt-2">Join our community</p>
        </div>

        <div className="space-y-6">
          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-[#5D4737] mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-[#D9CFC7] bg-[#F9F8F6] text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:border-transparent transition-all duration-200 disabled:opacity-60"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1 ml-1">{errors.username}</p>
            )}
          </div>

          {/* Email Field */}
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

          {/* Password Field */}
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
              <p className="text-red-500 text-sm mt-1 ml-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-[#5D4737] mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-[#D9CFC7] bg-[#F9F8F6] text-[#5D4737] placeholder-[#C9B59C] focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:border-transparent transition-all duration-200 disabled:opacity-60"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1 ml-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Password Requirements Hint */}
          <div className="text-xs text-[#8B7355] bg-[#F9F8F6] p-3 rounded-lg border border-[#EFE9E3]">
            <p className="font-medium mb-1">Password Requirements:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li className={form.password.length >= 4 ? "text-green-600" : ""}>
                At least 4 characters
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#C9B59C] to-[#B8A48B] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9B59C] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </div>

        {/* Footer Links */}
        <div className="mt-6 pt-6 border-t border-[#EFE9E3]">
          <p className="text-sm text-[#8B7355] text-center">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              disabled={loading}
              className="text-[#C9B59C] hover:text-[#B8A48B] font-medium transition-colors disabled:opacity-60"
            >
              Sign In
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Register;