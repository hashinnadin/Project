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

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length !== 0) return;

    try {const userCheck = await axios.get(
        `http://localhost:3001/users?email=${form.email}`
      );

      if (userCheck.data.length > 0) {
        toast.error("Email already registered!");
        return;
      }
      await axios.post("http://localhost:3001/users", {
        username: form.username,
        email: form.email,
        password: form.password,
      });

      toast.success("Registration Successful!");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
      <form
        onSubmit={handleSubmit}
        className="w-96 p-8 rounded-2xl shadow-2xl bg-gradient-to-br
        from-[#0d1b2a] via-[#112240] to-[#0a1a33] border border-[#1f355a]"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-white">
          Register
        </h2>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full p-3 bg-[#12263f] text-white rounded-lg mb-1"
        />
        {errors.username && (
          <p className="text-red-400 text-sm">{errors.username}</p>
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 bg-[#12263f] text-white rounded-lg mt-4 mb-1"
        />
        {errors.email && (
          <p className="text-red-400 text-sm">{errors.email}</p>
        )}
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
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full p-3 bg-[#12263f] text-white rounded-lg mt-4 mb-1"
        />
        {errors.confirmPassword && (
          <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
        )}
        <button className="w-full bg-blue-600 mt-6 p-3 rounded-lg text-white hover:bg-blue-700">
          Register
        </button>
        <p className="text-gray-300 text-sm mt-4 text-center">
          Already have an account?{" "}
          <span
            className="text-blue-400 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
export default Register;