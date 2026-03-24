"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    ghanaCardId: "",
    phoneNumber: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        const errorText = await res.text();
        setError(errorText || "Registration failed");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-primary mb-8">Create an Account</h2>
        
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-center">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">{success}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-secondary font-semibold mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-primary focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-secondary font-semibold mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-primary focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-secondary font-semibold mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-primary focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-secondary font-semibold mb-1">Ghana Card ID</label>
            <input
              type="text"
              name="ghanaCardId"
              value={formData.ghanaCardId}
              onChange={handleChange}
              placeholder="GHA-123456789-0"
              className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-primary focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-secondary font-semibold mb-1">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 p-2 rounded-lg focus:border-primary focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white p-3 rounded-xl font-bold hover:bg-opacity-90 transition-all text-lg shadow-md mt-4"
          >
            Register
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-secondary font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
