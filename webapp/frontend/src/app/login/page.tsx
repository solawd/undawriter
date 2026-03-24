"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        login(data);
        router.push("/customer"); // Default redirect to customer portal after login
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-primary mb-8">Login to UndaWriter</h2>
        
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-secondary font-semibold mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-secondary font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white p-4 rounded-xl font-bold hover:bg-opacity-90 transition-all text-lg shadow-md"
          >
            Sign In
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-secondary font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
