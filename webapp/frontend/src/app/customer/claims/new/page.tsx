"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function NewClaim() {
  const router = useRouter();
  const [policies, setPolicies] = useState<any[]>([]);
  const [policyId, setPolicyId] = useState("");
  const [payoutType, setPayoutType] = useState("CASH_IN_LIEU");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWithAuth("/api/v1/policies")
      .then(res => res.json())
      .then(data => {
        // Filter for active policies
        const activePolicies = data.filter((p: any) => p.policy.status === 'ACTIVE');
        setPolicies(activePolicies);
        if (activePolicies.length > 0) {
          setPolicyId(activePolicies[0].policy.id.toString());
        }
      })
      .catch(err => {
        console.error("Failed to fetch policies", err);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyId) {
      setError("Please select a policy.");
      return;
    }
    setError("");
    setSubmitting(true);

    const formData = new FormData();
    formData.append("policyId", policyId);
    formData.append("payoutType", payoutType);
    formData.append("description", description);
    
    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
    }

    try {
      const res = await fetchWithAuth("/api/v1/claims/file", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        router.push("/customer/claims");
      } else {
        const errData = await res.json();
        setError(errData.message || "Failed to submit claim.");
      }
    } catch (err) {
      setError("An error occurred while submitting the claim.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold text-primary mb-2">File a New Claim</h1>
      <p className="text-gray-500 mb-8">Please provide details about your property damage.</p>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-secondary mb-2">Select Policy</label>
          <select 
            value={policyId}
            onChange={(e) => setPolicyId(e.target.value)}
            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none transition-colors"
            required
          >
            <option value="" disabled>Select an active policy</option>
            {policies.map((p) => {
              const label = p.motorDetails 
                ? `${p.motorDetails.makeModel} (${p.motorDetails.regNumber}) - POL-${p.policy.id}` 
                : `${p.policy.productType} Insurance - POL-${p.policy.id}`;
              return (
                <option key={p.policy.id} value={p.policy.id}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-secondary mb-2">Payout Preference</label>
          <div className="flex gap-6 p-4 rounded-lg border-2 border-gray-100 bg-gray-50">
            <label className="flex items-center gap-2 cursor-pointer transition-colors hover:text-primary">
              <input 
                type="radio" 
                name="payoutType" 
                value="CASH_IN_LIEU" 
                checked={payoutType === "CASH_IN_LIEU"}
                onChange={(e) => setPayoutType(e.target.value)}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <span className="font-medium">Cash in Lieu</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer transition-colors hover:text-primary">
              <input 
                type="radio" 
                name="payoutType" 
                value="SERVICE_PROVIDER" 
                checked={payoutType === "SERVICE_PROVIDER"}
                onChange={(e) => setPayoutType(e.target.value)}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <span className="font-medium">Service Provider</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-secondary mb-2">Description of Damage</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none min-h-[120px] transition-all resize-y"
            placeholder="Please detail how the damage occurred and the extent of the damage..."
            required
          />
        </div>

        <div>
           <label className="block text-sm font-semibold text-secondary mb-2">Supporting Documents</label>
           <p className="text-xs text-gray-500 mb-2">Upload photos of the damage, police reports, or any related documents.</p>
           <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition-colors hover:bg-gray-50/50">
               <input 
                 type="file" 
                 multiple
                 onChange={(e) => setFiles(e.target.files)}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 accept="image/*,.pdf"
               />
               <div className="pointer-events-none text-center flex flex-col items-center">
                  <span className="text-3xl mb-2">📸</span>
                  <span className="text-primary font-bold">Click to upload</span>
                  <span className="text-gray-500 text-sm mt-1">or drag and drop files here</span>
                  {files && files.length > 0 && (
                      <span className="mt-3 text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full text-sm">
                          {files.length} file(s) selected
                      </span>
                  )}
               </div>
           </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-white p-4 rounded-xl font-bold hover:bg-opacity-90 transition-all text-lg shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed group flex justify-center items-center gap-2"
        >
          {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting Claim...
              </>
          ) : "Submit Claim"}
        </button>
      </form>
    </div>
  );
}
