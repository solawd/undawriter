"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import Link from "next/link";

export default function Claims() {
  const [claimsData, setClaimsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/api/v1/claims/user")
      .then(res => res.json())
      .then(data => {
        setClaimsData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch claims", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-primary">My Claims</h1>
        <Link 
          href="/customer/claims/new"
          className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-colors"
        >
          File a New Claim
        </Link>
      </div>
      <p className="text-gray-500 mb-8">View and manage your insurance claims.</p>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading claims...</div>
      ) : claimsData.length > 0 ? (
         <div className="space-y-4">
            {claimsData.map((claim, index) => {
              return (
                <div key={claim.id || index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary">Claim #{claim.id}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Policy: POL-{claim.policyId} • {claim.policyType}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1.5 font-semibold px-3 py-1 rounded-lg text-sm ${
                        claim.status === 'APPROVED' ? 'bg-green-50 text-green-700' : 
                        claim.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                        claim.status === 'UNDER_REVIEW' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {claim.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-4 text-sm">
                     <div>
                        <p className="text-gray-500">Payout Type</p>
                        <p className="font-semibold text-gray-900">{claim.payoutType}</p>
                     </div>
                     <div>
                        <p className="text-gray-500">Submitted On</p>
                        <p className="font-semibold text-gray-900">{new Date(claim.createdAt).toLocaleDateString()}</p>
                     </div>
                     <div className="col-span-2 mt-2">
                        <p className="text-gray-500">Description</p>
                        <p className="font-semibold text-gray-900">{claim.description || "No description provided."}</p>
                     </div>
                     {claim.evidenceUrls && claim.evidenceUrls.length > 0 && (
                        <div className="col-span-2 mt-2">
                            <p className="text-gray-500 mb-1">Evidences</p>
                            <div className="flex flex-wrap gap-2">
                                {claim.evidenceUrls.map((url: string, i: number) => (
                                    <a key={i} href={url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                                        <span>📄</span> View Document {i+1}
                                    </a>
                                ))}
                            </div>
                        </div>
                     )}
                     {claim.adjusterNotes && (
                        <div className="col-span-2 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-xs text-secondary font-bold mb-1">Adjuster Notes</p>
                          <p className="text-gray-700">{claim.adjusterNotes}</p>
                        </div>
                     )}
                  </div>
                </div>
              );
            })}
         </div>
      ) : (
        <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl text-center text-gray-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🗂️</span>
            </div>
            <p className="text-lg font-semibold text-gray-700">No Claims Found</p>
            <p className="mt-1">You haven't filed any claims yet.</p>
        </div>
      )}
    </div>
  );
}
