"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";

export default function StaffProfile() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    // Basic user info is in localStorage for MVP
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      setFullName(u.fullName || "");
      // Currently phone number might not be in the stored minimal user object, but we'll allow updating it here
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: "New passwords do not match." });
      return;
    }

    if (newPassword && !currentPassword) {
      setMessage({ type: 'error', text: "Current password is required to set a new password." });
      return;
    }

    setLoading(true);

    try {
      const res = await fetchWithAuth("/api/v1/staff/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName,
          phoneNumber,
          currentPassword,
          newPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: "Profile updated successfully!" });
        // Update local storage name if it changed
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const u = JSON.parse(userStr);
          u.fullName = data.user.fullName;
          localStorage.setItem("user", JSON.stringify(u));
        }
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: 'error', text: data.message || "Failed to update profile." });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mt-8">
      <h1 className="text-3xl font-bold text-primary mb-2">My Profile</h1>
      <p className="text-gray-500 mb-8">Update your personal information and password.</p>

      {message && (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="pt-4 border-t border-gray-100">
           <h2 className="text-xl font-bold text-secondary mb-4">Personal Information</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Leave blank to keep unchanged"
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
           </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
           <h2 className="text-xl font-bold text-secondary mb-1">Change Password</h2>
           <p className="text-sm text-gray-500 mb-4">Leave these blank if you do not wish to change your password.</p>
           
           <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none"
                    />
                  </div>
              </div>
           </div>
        </div>

        <div className="pt-6">
            <button 
                type="submit" 
                disabled={loading}
                className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
                {loading ? "Saving..." : "Save Changes"}
            </button>
        </div>
      </form>
    </div>
  );
}
