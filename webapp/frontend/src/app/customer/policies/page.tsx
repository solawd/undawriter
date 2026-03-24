"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import Link from "next/link";

export default function ActivePolicies() {
  const [policiesData, setPoliciesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/api/v1/policies")
      .then(res => res.json())
      .then(data => {
        setPoliciesData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch policies", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold text-primary mb-2">Active Policies</h1>
      <p className="text-gray-500 mb-8">View and manage your current insurance coverage.</p>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading policies...</div>
      ) : policiesData.length > 0 ? (
         <div className="space-y-4">
            {policiesData.map((item, index) => {
              const { policy, motorDetails } = item;
              const title = motorDetails 
                ? `${motorDetails.makeModel} (${motorDetails.regNumber})`
                : `${policy.productType} Insurance`;
                
              return (
                <div key={policy.id || index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                        {policy.productType}
                      </span>
                      <h3 className="text-xl font-bold text-primary">{title}</h3>
                      <p className="text-sm text-gray-500 mt-1">Policy No: POL-{policy.id.toString().padStart(6, '0')}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1.5 font-semibold px-3 py-1 rounded-lg text-sm ${
                        policy.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${policy.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {policy.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4 mt-4 text-sm">
                     <div>
                        <p className="text-gray-500">Coverage Period</p>
                        <p className="font-semibold text-gray-900">{policy.startDate} - {policy.endDate}</p>
                     </div>
                     <div>
                        <p className="text-gray-500">Premium Paid</p>
                        <p className="font-semibold text-gray-900">GHS {policy.premiumNet}</p>
                     </div>
                     <div className="flex justify-end items-center">
                       <Link 
                         href={`/customer/policies/receipt?id=${policy.id}`}
                         className="text-secondary font-bold hover:underline flex items-center gap-1"
                       >
                          View Receipt <span className="text-lg">📄</span>
                       </Link>
                     </div>
                  </div>
                </div>
              );
            })}
         </div>
      ) : (
        <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl text-center text-gray-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-700">No Active Policies</p>
            <p className="mt-1">You don't have any active insurance policies yet.</p>
            <Link 
              href="/customer/motor"
              className="mt-6 bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-colors"
            >
              Get a Quote
            </Link>
        </div>
      )}
    </div>
  );
}
