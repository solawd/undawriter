"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";

type TabType = "POLICIES" | "CLAIMS";

function StaffCustomerDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  
  const [activeTab, setActiveTab] = useState<TabType>("POLICIES");
  
  const [customer, setCustomer] = useState<any>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCustomerData();
    }
  }, [id]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const authUrl = `/api/v1/staff/customers/${id}`;
      const [userRes, polRes, claimRes] = await Promise.all([
        fetchWithAuth(authUrl),
        fetchWithAuth(`${authUrl}/policies`),
        fetchWithAuth(`${authUrl}/claims`)
      ]);

      if (userRes.ok) {
        setCustomer(await userRes.json());
      }
      if (polRes.ok) {
        setPolicies(await polRes.json());
      }
      if (claimRes.ok) {
        setClaims(await claimRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch customer aggregated data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading customer portfolio...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4 mb-6">
         <button onClick={() => router.push('/staff/customers')} className="text-gray-500 hover:text-primary transition-colors font-medium">
          ← Back to Customers
        </button>
        <h1 className="text-3xl font-bold text-primary flex-1">Customer Profile</h1>
      </div>

      {/* Customer Header Card */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold uppercase shadow-inner">
             {customer?.fullName?.charAt(0) || "C"}
          </div>
          <div className="flex-1">
             <h2 className="text-2xl font-bold text-gray-800">{customer?.fullName || "Customer CUST-" + id}</h2>
             <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-gray-600">
                <p className="flex items-center gap-2"><span>✉️</span> {customer?.email || "Unknown Email"}</p>
                <p className="flex items-center gap-2"><span>📞</span> {customer?.phoneNumber || "No Phone Number"}</p>
                <p className="flex items-center gap-2"><span>🪪</span> {customer?.ghanaCardId || "No ID"}</p>
             </div>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
             <span className="bg-blue-50 text-secondary border border-blue-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
               CUST-{id}
             </span>
             <span className="text-sm text-gray-500 font-medium">{policies.length} Policies • {claims.length} Claims</span>
          </div>
      </div>

      {/* Tabbed Navigation */}
      <div className="border-b-2 border-gray-100 flex gap-8 px-4">
        <button 
          onClick={() => setActiveTab("POLICIES")}
          className={`pb-4 text-lg font-bold transition-all relative ${activeTab === "POLICIES" ? "text-primary" : "text-gray-400 hover:text-gray-600"}`}
        >
          Policies ({policies.length})
          {activeTab === "POLICIES" && <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-primary rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab("CLAIMS")}
          className={`pb-4 text-lg font-bold transition-all relative ${activeTab === "CLAIMS" ? "text-primary" : "text-gray-400 hover:text-gray-600"}`}
        >
          Claims ({claims.length})
          {activeTab === "CLAIMS" && <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-primary rounded-t-full" />}
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
        
        {activeTab === "POLICIES" && (
           <div className="space-y-4">
              {policies.length === 0 ? (
                 <div className="text-center text-gray-400 py-12 italic">No policies found for this customer.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {policies.map(policy => (
                      <div key={policy.id} onClick={() => router.push(`/staff/policies/detail?id=${policy.id}`)} className="group cursor-pointer border-2 border-gray-100 hover:border-primary/50 bg-gray-50 hover:bg-white rounded-2xl p-6 transition-all shadow-sm hover:shadow-md flex flex-col relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                         <div className="flex justify-between items-start mb-4">
                            <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">{policy.productType}</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${policy.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{policy.status}</span>
                         </div>
                         <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-primary transition-colors">POL-{policy.id}</h3>
                         <p className="text-gray-500 text-sm mb-4">Starts: {new Date(policy.startDate).toLocaleDateString()}</p>
                         <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-secondary font-bold text-lg">💰 {policy.premiumNet?.toFixed(2) || "0.00"}</span>
                            <span className="text-primary font-semibold text-sm group-hover:underline">View →</span>
                         </div>
                      </div>
                   ))}
                </div>
              )}
           </div>
        )}

        {activeTab === "CLAIMS" && (
           <div className="space-y-4">
              {claims.length === 0 ? (
                 <div className="text-center text-gray-400 py-12 italic">No claims filed by this customer.</div>
              ) : (
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                             <th className="p-4 rounded-tl-xl">Claim ID</th>
                             <th className="p-4">Policy Type</th>
                             <th className="p-4">Date Filed</th>
                             <th className="p-4">Status</th>
                             <th className="p-4 text-center rounded-tr-xl">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                          {claims.map(claim => (
                             <tr key={claim.id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="p-4 font-semibold text-gray-800">CLM-{claim.id}</td>
                                <td className="p-4 text-gray-600">{claim.policyType}</td>
                                <td className="p-4 text-gray-600">{new Date(claim.createdAt || Date.now()).toLocaleDateString()}</td>
                                <td className="p-4">
                                   <span className={`inline-flex items-center gap-1.5 font-bold px-3 py-1 rounded-md text-xs ${
                                      claim.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                                      claim.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                      claim.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-blue-100 text-blue-800'
                                   }`}>
                                     {claim.status}
                                   </span>
                                </td>
                                <td className="p-4 text-center">
                                   <button 
                                      onClick={() => router.push(`/staff/claims/detail?id=${claim.id}`)}
                                      className="text-primary hover:text-secondary font-bold text-sm bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors"
                                   >
                                      Review
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              )}
           </div>
        )}

      </div>
    </div>
  );
}

export default function StaffCustomerDetail() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading profile data...</div>}>
      <StaffCustomerDetailContent />
    </Suspense>
  );
}
