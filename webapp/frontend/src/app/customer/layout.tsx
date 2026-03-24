"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: "Active Policies", href: "/customer/policies", icon: "🛡️" },
    { name: "Claims", href: "/customer/claims", icon: "📑" },
    { name: "Motor Insurance", href: "/customer/motor", icon: "🚗" },
    { name: "Home Insurance", href: "/customer/home", icon: "🏠" },
    { name: "Travel Insurance", href: "/customer/travel", icon: "✈️" },
    { name: "Profile", href: "/customer/profile", icon: "👤" },
  ];

  return (
    <ProtectedRoute allowedProfiles={['CUSTOMER']}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-primary text-white flex flex-col shadow-xl fixed h-full z-10 transition-all">
          <div className="p-6 border-b border-white/20 flex flex-col items-center text-center">
            <Image 
              src="/UndaWriterLogo.png" 
              alt="UndaWriter Logo" 
              width={64} 
              height={64} 
              className="mb-3 object-contain"
            />
            <h2 className="text-2xl font-bold tracking-wider">UndaWriter</h2>
            <p className="text-sm text-blue-200 mt-1">Customer Portal</p>
          </div>
          
          <nav className="flex-1 mt-6 px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-secondary text-white shadow-md font-semibold" 
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/20">
            <div className="flex items-center mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-bold shadow-inner">
                {user?.fullName?.charAt(0) || "U"}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                <p className="text-xs text-blue-200 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-300 hover:bg-red-500/20 hover:text-red-100 rounded-lg transition-colors"
            >
              <span className="text-xl">🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
