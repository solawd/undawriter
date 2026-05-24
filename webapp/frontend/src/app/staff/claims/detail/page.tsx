"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import ClaimMessages from "@/components/ClaimMessages";

function StaffClaimDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Status Form State
  const [newStatus, setNewStatus] = useState("");
  const [adjusterNotes, setAdjusterNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchClaim();
    }
  }, [id]);

  const fetchClaim = () => {
    setLoading(true);
    fetchWithAuth(`/api/v1/staff/claims/${id}`)
      .then(res => res.json())
      .then(data => {
        setClaim(data);
        setNewStatus(data.status);
        setAdjusterNotes(data.adjusterNotes || "");
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch claim details", err);
        setLoading(false);
      });
  };

  const submitStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claim || !newStatus) return;
    
    setUpdating(true);
    try {
        const res = await fetchWithAuth(`/api/v1/staff/claims/${id}/status`, {
            method: "PUT",
            body: JSON.stringify({ status: newStatus, adjusterNotes })
        });
        if (res.ok) {
            alert("Claim status updated successfully!");
            fetchClaim();
        } else {
            alert("Failed to update status");
        }
    } catch(err) {
        alert("An error occurred");
    } finally {
        setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading claim details...</div>;
  if (!claim) return <div className="p-8 text-center text-red-500">Claim not found.</div>;

  const isImage = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || "");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-primary transition-colors">
          ← Back to Claims
        </button>
        <h1 className="text-3xl font-bold text-primary flex-1">Claim: CLM-{claim.id}</h1>
        <span className={`inline-flex items-center gap-1.5 font-bold px-4 py-2 rounded-lg text-sm ${
          claim.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
          claim.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
          claim.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {claim.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Claim Data & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Incident Description</h2>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-gray-700 whitespace-pre-wrap leading-relaxed">
               {claim.description}
            </div>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-6 border-b pb-2">Provided Evidence</h2>
            {claim.evidenceUrls && claim.evidenceUrls.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {claim.evidenceUrls.map((url: string, i: number) => {
                      const fullUrl = url; // Use relative URL since backend serves frontend
                      return isImage(url) ? (
                          <a key={i} href={fullUrl} target="_blank" rel="noreferrer" className="group block relative aspect-square overflow-hidden rounded-xl border-2 border-gray-100 hover:border-primary transition-all">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={fullUrl} alt={`Evidence ${i+1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                  <span className="opacity-0 group-hover:opacity-100 text-white font-bold drop-shadow-md">View Full</span>
                              </div>
                          </a>
                      ) : (
                          <a key={i} href={fullUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-6 bg-blue-50 text-secondary border-2 border-blue-100 hover:border-blue-300 rounded-xl transition-all aspect-square text-center">
                              <span className="text-4xl mb-2">📄</span>
                              <span className="font-semibold text-sm">Document {i+1}</span>
                              <span className="text-xs text-blue-400 mt-1 uppercase">{url.split('.').pop()}</span>
                          </a>
                      );
                  })}
                </div>
            ) : (
                <p className="text-gray-500 italic p-4 bg-gray-50 rounded-lg text-center">No evidence files attached to this claim.</p>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
             <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Related Policy & Customer</h2>
             <div className="grid grid-cols-2 gap-y-4 text-sm">
                <p className="text-gray-500">Policy Number</p>
                <p className="font-semibold text-right text-primary cursor-pointer hover:underline" onClick={() => router.push(`/staff/policies/detail?id=${claim.policyId}`)}>POL-{claim.policyId}</p>
                <p className="text-gray-500">Product Type</p>
                <p className="font-semibold text-right">{claim.policyType}</p>
                <div className="col-span-2 border-t my-2"></div>
                <p className="text-gray-500">Customer Name</p>
                <p className="font-semibold text-right">{claim.customerName}</p>
             </div>
          </div>

          <ClaimMessages claimId={claim.id} apiBaseUrl="/api/v1/staff/claims" />
        </div>

        {/* Right Column: Update Status Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-primary/10 sticky top-6">
            <h2 className="text-xl font-bold text-primary mb-2">Review & Decisions</h2>
            <p className="text-sm text-gray-500 mb-6">Manage the progression of this claim.</p>

            <form onSubmit={submitStatusUpdate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-secondary mb-2">Update Status To</label>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-primary focus:outline-none bg-gray-50 font-medium cursor-pointer"
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="APPROVED">Approved / Successful</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary mb-2 whitespace-nowrap">Adjuster Notes (Internal)</label>
                <textarea 
                  value={adjusterNotes}
                  onChange={(e) => setAdjusterNotes(e.target.value)}
                  placeholder="Record your findings, reasons for rejection, or settlement notes here..."
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-primary focus:outline-none min-h-[160px] text-sm leading-relaxed bg-gray-50"
                />
              </div>

              <button 
                  type="submit" 
                  disabled={updating}
                  className="w-full bg-primary text-white p-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50 shadow-sm mt-4"
              >
                  {updating ? "Saving Update..." : "Confirm Decision"}
              </button>
            </form>

            {claim.createdAt && (
               <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-center text-gray-400">
                  Claim Originally Filed On: <br/>
                  <span className="font-semibold text-gray-500 text-sm mt-1 inline-block">{new Date(claim.createdAt).toLocaleString()}</span>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaffClaimDetail() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading claim context...</div>}>
      <StaffClaimDetailContent />
    </Suspense>
  );
}
