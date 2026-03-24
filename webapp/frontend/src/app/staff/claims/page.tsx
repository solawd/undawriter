"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import Link from "next/link";

export default function StaffClaims() {
  const [claims, setClaims] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchClaims = (pageNum: number, search: string) => {
    setLoading(true);
    const query = new URLSearchParams({
      page: pageNum.toString(),
      size: "10"
    });
    if (search) {
      query.append("search", search);
    }

    fetchWithAuth(`/api/v1/staff/claims?${query.toString()}`)
      .then(res => res.json())
      .then(data => {
        setClaims(data.content || []);
        setTotalPages(data.totalPages || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch claims", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClaims(page, searchTerm);
  }, [page]); 

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchClaims(0, searchTerm);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[80vh] relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-primary">All Claims</h1>
        
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
        <div className="text-center p-8 text-gray-500">Loading Claims...</div>
      ) : claims.length === 0 ? (
        <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">No claims found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200 text-sm uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">Claim ID</th>
                <th className="p-4 font-semibold">Policy</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Submitted On</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-primary">CLM-{claim.id}</td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">POL-{claim.policyId}</p>
                    <p className="text-xs text-gray-500">{claim.policyType}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 font-semibold px-2 py-1 rounded text-xs ${
                      claim.status === 'APPROVED' ? 'bg-green-50 text-green-700' : 
                      claim.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                      claim.status === 'UNDER_REVIEW' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <Link 
                      href={`/staff/claims/detail?id=${claim.id}`}
                      className="text-primary hover:underline font-medium text-sm"
                    >
                      View & Manage
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
