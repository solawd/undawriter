"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StaffCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchCustomers(search, page);
  }, [page]);

  const fetchCustomers = (searchQuery: string, pageNum: number) => {
    setLoading(true);
    const url = `/api/v1/staff/customers?search=${encodeURIComponent(searchQuery)}&page=${pageNum}&size=10`;

    fetchWithAuth(url)
      .then(res => res.json())
      .then(data => {
        setCustomers(data.content || []);
        setTotalPages(data.totalPages || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch customers", err);
        setLoading(false);
      });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0); // reset to first page
    fetchCustomers(search, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <span>👥</span> Customers
        </h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center gap-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-lg relative">
          <input 
            type="text" 
            placeholder="Search by name, email, phone, or Ghana Card..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <button type="submit" className="hidden">Search</button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-secondary uppercase text-xs font-bold tracking-wider border-b border-gray-100">
                <th className="p-4 pl-6">ID</th>
                <th className="p-4">Full Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Contact</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 italic">No customers found matching your criteria.</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="p-4 pl-6 font-semibold text-gray-700">CUST-{customer.id}</td>
                    <td className="p-4 font-bold text-primary">{customer.fullName}</td>
                    <td className="p-4 text-gray-600">{customer.email}</td>
                    <td className="p-4 text-gray-600 space-y-1">
                      <div>{customer.phoneNumber || "No Phone"}</div>
                      <div className="text-xs text-gray-400 font-mono">{customer.ghanaCardId}</div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => router.push(`/staff/customers/detail?id=${customer.id}`)}
                        className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm group-hover:shadow-md"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <button 
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-gray-50 transition-colors shadow-sm"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500 font-medium">Page {page + 1} of {totalPages}</span>
            <button 
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-gray-50 transition-colors shadow-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
