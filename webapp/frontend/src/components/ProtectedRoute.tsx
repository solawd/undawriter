"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children, allowedProfiles }: { children: React.ReactNode, allowedProfiles?: string[] }) {
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!user) {
        window.location.href = "/login";
      } else if (allowedProfiles && allowedProfiles.length > 0) {
        if (!allowedProfiles.includes(user.profile)) {
          // If a customer tries to access staff
          if (user.profile === "CUSTOMER") {
            window.location.href = "/customer";
          } else {
            // Default fallback
            window.location.href = "/login";
          }
        }
      }
    }
  }, [mounted, isLoading, user, allowedProfiles]);

  if (!mounted || isLoading) return null; // Prevent hydration errors and wait for auth check
  
  if (!user) return null; // Wait for redirect to happen
  
  if (allowedProfiles && allowedProfiles.length > 0 && !allowedProfiles.includes(user.profile)) return null;

  return <>{children}</>;
}
