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

    try {
      const res = await axios.get(
        `http://localhost:3000/users?email=${form.email}&password=${form.password}`
      );

      if (res.data.length === 0) {
        toast.error("Invalid email or password");
        return;
      }

      // SAVE USER IN LOCAL STORAGE
      localStorage.setItem("user", JSON.stringify(res.data[0]));

      toast.success("Login Successful!");
      navigate("/"); // Go to home
    } catch (error) {
      console.error(error);
      toast.error("Server error!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
      <form
        onSubmit={handleLogin}
        className="w-96 p-8 rounded-2xl shadow-2xl 
        bg-gradient-to-br from-[#0d1b2a] via-[#112240] to-[#0a1a33] border border-[#1f355a]"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-white">
          Login
        </h2>

        {/* EMAIL */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 bg-[#12263f] text-white rounded-lg mb-1"
        />
        {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}

        {/* PASSWORD */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 bg-[#12263f] text-white rounded-lg mt-4 mb-1"
        />
        {errors.password && (
          <p className="text-red-400 text-sm">{errors.password}</p>
        )}

        <button className="w-full bg-blue-600 mt-6 p-3 rounded-lg text-white hover:bg-blue-700">
          Login
        </button>

        <p className="text-gray-300 text-sm mt-4 text-center">
          Don't have an account?{" "}
          <span
            className="text-blue-400 cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;
