"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/staff", icon: "📊" },
    { name: "Customers", href: "/staff/customers", icon: "👥" },
    { name: "Policies", href: "/staff/policies", icon: "🛡️" },
    { name: "Claims", href: "/staff/claims", icon: "📑" },
    { name: "Profile", href: "/staff/profile", icon: "👤" },
  ];

  const normalizedPathname = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  if (normalizedPathname === "/staff/login") {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute allowedProfiles={['STAFF', 'ADMIN']}>
      <div className="flex min-h-screen bg-gray-50">
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
            <p className="text-sm text-blue-200 mt-1">Staff Portal</p>
          </div>
          
          <nav className="flex-1 mt-6 px-4 space-y-2">
            {navItems.map((item) => {
              const isActive = normalizedPathname === item.href || normalizedPathname.startsWith(item.href + "/");
              
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
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-bold shadow-inner uppercase">
                {user?.fullName?.charAt(0) || "S"}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold truncate">{user?.fullName || "Staff Level"}</p>
                <p className="text-xs text-blue-200 truncate">{user?.email || "staff@undawriter.com"}</p>
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

        <main className="flex-1 ml-64 p-8 w-full">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
