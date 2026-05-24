"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import Link from "next/link";
import ClaimMessages from "@/components/ClaimMessages";

function ClaimDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In current backend, getting a specific claim for customer isn't explicitly defined except via finding it in the list.
    // We can fetch all and filter, or just rely on backend API. 
    // Wait, we only have /api/v1/claims/user which returns all user claims.
    if (id) {
      fetchWithAuth("/api/v1/claims/user")
        .then(res => res.json())
        .then(data => {
          const found = data.find((c: any) => c.id.toString() === id);
          setClaim(found);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading claim details...</div>;
  if (!claim) return <div className="p-8 text-center text-red-500">Claim not found or access denied.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Claim #{claim.id}</h1>
        <Link 
          href="/customer/claims"
          className="text-gray-500 hover:text-gray-800 font-semibold"
        >
          &larr; Back to Claims
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <div>
            <p className="text-gray-500 text-sm">Policy Reference</p>
            <p className="font-bold text-lg text-primary">POL-{claim.policyId} • {claim.policyType}</p>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center gap-1.5 font-semibold px-4 py-2 rounded-lg text-sm ${
              claim.status === 'APPROVED' ? 'bg-green-50 text-green-700' : 
              claim.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
              claim.status === 'UNDER_REVIEW' ? 'bg-yellow-50 text-yellow-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              {claim.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Payout Type</p>
            <p className="font-semibold text-gray-900">{claim.payoutType}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Submitted On</p>
            <p className="font-semibold text-gray-900">{new Date(claim.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div className="col-span-2">
            <p className="text-gray-500 mb-2">Description</p>
            <p className="text-gray-900 bg-gray-50 p-4 rounded-xl">{claim.description || "No description provided."}</p>
          </div>

          {claim.evidenceUrls && claim.evidenceUrls.length > 0 && (
            <div className="col-span-2">
                <p className="text-gray-500 mb-2">Evidences Attached</p>
                <div className="flex flex-wrap gap-3">
                    {claim.evidenceUrls.map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100">
                            <span className="text-xl">📄</span> Document {i+1}
                        </a>
                    ))}
                </div>
            </div>
          )}

          {claim.adjusterNotes && (
            <div className="col-span-2 mt-2 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
              <p className="text-xs text-yellow-800 font-bold mb-2 uppercase tracking-wider">Adjuster Notes</p>
              <p className="text-yellow-900">{claim.adjusterNotes}</p>
            </div>
          )}
        </div>
      </div>

      <ClaimMessages claimId={claim.id} apiBaseUrl="/api/v1/claims" />
    </div>
  );
}

export default function ClaimDetail() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ClaimDetailContent />
    </Suspense>
  );
}
