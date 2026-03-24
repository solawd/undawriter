"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import Link from "next/link";

export default function StaffPolicies() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = (pageNum: number, search: string) => {
    setLoading(true);
    const query = new URLSearchParams({
      page: pageNum.toString(),
      size: "10"
    });
    if (search) {
      query.append("search", search);
    }

    fetchWithAuth(`/api/v1/staff/policies?${query.toString()}`)
      .then(res => res.json())
      .then(data => {
        setPolicies(data.content || []);
        setTotalPages(data.totalPages || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch policies", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPolicies(page, searchTerm);
  }, [page]); // Search will be triggered manually by button or enter

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0); // Reset to first page
    fetchPolicies(0, searchTerm);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[80vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-primary">All Policies</h1>
        
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search by Name, Phone, ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-2 border-gray-200 px-4 py-2 rounded-lg focus:border-primary focus:outline-none w-full md:w-64"
          />
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-opacity-90">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center p-8 text-gray-500">Loading Policies...</div>
      ) : policies.length === 0 ? (
        <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">No policies found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200 text-sm uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">Policy ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Start - End</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => (
                <tr key={policy.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-primary">POL-{policy.id}</td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">{policy.user?.fullName || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{policy.user?.phoneNumber || 'N/A'}</p>
                  </td>
                  <td className="p-4 font-medium">{policy.productType}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 font-semibold px-2 py-1 rounded text-xs ${
                      policy.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 
                      policy.status === 'EXPIRED' ? 'bg-red-50 text-red-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      {policy.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {policy.startDate} <br/><span className="text-xs text-gray-400">to</span> {policy.endDate}
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/staff/policies/detail?id=${policy.id}`} className="text-primary hover:underline font-medium text-sm">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500">Page {page + 1} of {totalPages}</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
