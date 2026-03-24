"use client";

import { useAuth } from "@/context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold text-primary mb-2">My Profile</h1>
      <p className="text-gray-500 mb-8">Manage your personal information and account security.</p>

      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h2 className="text-xl font-bold text-secondary mb-4">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 font-semibold">Full Name</p>
              <p className="text-lg text-gray-900">{user?.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Email Address</p>
              <p className="text-lg text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Ghana Card ID</p>
              <p className="text-lg text-gray-900">{user?.ghanaCardId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold">Account Status</p>
              <p className="text-lg text-green-600 font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                Active
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl text-center text-gray-500">
          <p className="text-lg font-semibold mb-2">Password Management</p>
          <p className="text-sm">Password change functionality will be available in the next release.</p>
        </div>
      </div>
    </div>
  );
}
