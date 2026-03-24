"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomerBaseRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/customer/policies");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-gray-300 h-10 w-10"></div>
        <div className="flex-1 space-y-6 py-1">
          <div className="h-2 bg-gray-300 rounded"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-gray-300 rounded col-span-2"></div>
              <div className="h-2 bg-gray-300 rounded col-span-1"></div>
            </div>
            <div className="h-2 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
