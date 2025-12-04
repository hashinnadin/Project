import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function AdminLogin() {
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
    const newErrors = {};

    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password.trim()) newErrors.password = "Password is required";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length !== 0) return;

    // 🔐 Simple hardcoded admin login
    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_PASSWORD = "admin123";

    if (form.email === ADMIN_EMAIL && form.password === ADMIN_PASSWORD) {
      // Save admin session
      localStorage.setItem(
        "admin",
        JSON.stringify({ email: ADMIN_EMAIL, role: "admin" })
      );

      toast.success("Admin login successful!");
      navigate("/admin"); // go to admin dashboard
    } else {
      toast.error("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <form
        onSubmit={handleSubmit}
        className="w-96 p-8 rounded-2xl shadow-2xl 
        bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] 
        border border-[#1f2937]"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-white">
          Admin Login
        </h2>

        <input
          type="email"
          name="email"
          placeholder="Admin Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 bg-[#111827] text-white rounded-lg mb-1 outline-none"
        />
        {errors.email && (
          <p className="text-red-400 text-sm mb-2">{errors.email}</p>
        )}

        <input
          type="password"
          name="password"
          placeholder="Admin Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 bg-[#111827] text-white rounded-lg mt-3 mb-1 outline-none"
        />
        {errors.password && (
          <p className="text-red-400 text-sm mb-2">{errors.password}</p>
        )}

        <button className="w-full bg-amber-500 mt-6 p-3 rounded-lg text-white font-semibold hover:bg-amber-600 transition">
          Login as Admin
        </button>

        <p
          className="text-gray-400 text-xs mt-4 text-center cursor-pointer hover:text-gray-200"
          onClick={() => navigate("/")}
        >
          ⬅ Back to User Website
        </p>
      </form>
    </div>
  );
}

export default AdminLogin;
