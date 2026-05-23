"use client";

import { useState, useRef, Suspense } from "react";
import { fetchWithAuth } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import SignatureCanvas from "react-signature-canvas";

function SignPolicyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const policyId = searchParams.get("policyId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"DRAW" | "UPLOAD">("DRAW");
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);

  const sigCanvas = useRef<SignatureCanvas>(null);

  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
    setUploadedBase64(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!policyId) {
        alert("Invalid policy ID");
        return;
      }

      let signatureBase64 = "";

      if (activeTab === "DRAW") {
        if (!sigCanvas.current) {
          alert("Signature pad is not initialized.");
          return;
        }
        
        let canvasElement: any = null;
        try {
          if (typeof (sigCanvas.current as any).getTrimmedCanvas === 'function') {
            canvasElement = (sigCanvas.current as any).getTrimmedCanvas();
          } else if (typeof (sigCanvas.current as any).getCanvas === 'function') {
            canvasElement = (sigCanvas.current as any).getCanvas();
          } else {
            canvasElement = sigCanvas.current;
          }
        } catch (err) {
          console.warn("Could not get trimmed canvas, falling back to raw canvas", err);
          if (typeof (sigCanvas.current as any).getCanvas === 'function') {
            canvasElement = (sigCanvas.current as any).getCanvas();
          }
        }

        if (!canvasElement || typeof canvasElement.toDataURL !== 'function') {
          alert("Error extracting signature. Please use the 'Upload Image' tab instead.");
          return;
        }

        signatureBase64 = canvasElement.toDataURL("image/png");

        // A blank PNG is usually a very short string (e.g. around 60-80 chars)
        if (!signatureBase64 || signatureBase64.length < 150) {
          alert("Please provide a signature first.");
          return;
        }
      } else {
        if (!uploadedBase64) {
          alert("Please upload a signature image first.");
          return;
        }
        signatureBase64 = uploadedBase64;
      }

      setIsSubmitting(true);
      
      const response = await fetchWithAuth(`/api/v1/policies/${policyId}/sign`, {
        method: "POST",
        body: JSON.stringify({ signatureBase64 })
      });

      if (response.ok) {
        router.push(`/customer/policies/receipt?id=${policyId}`);
      } else {
        const text = await response.text();
        console.error("Backend error:", text);
        alert("Failed to submit signature. Please try again.");
      }
    } catch (error: any) {
      console.error("Signature submission error", error);
      alert("An error occurred during submission: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!policyId) {
    return <div className="p-8 text-center text-gray-500">Invalid Policy Reference.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold text-primary mb-2">Sign Policy Document</h1>
      <p className="text-gray-500 mb-8">Please review the standard terms and sign below to finalize your policy.</p>

      {/* Standard Policy Text Box */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 h-64 overflow-y-auto text-sm text-gray-700 leading-relaxed">
        <h3 className="font-bold text-lg mb-2 text-primary">Standard Motor Insurance Policy Terms</h3>
        <p className="mb-4">
          This Policy is a contract of insurance between you (the Policyholder) and UndaWriter Insure. 
          In consideration of the payment of the premium, we will provide insurance in accordance with 
          the terms, conditions, exceptions, and endorsements contained in this document.
        </p>
        <p className="mb-4">
          <strong>1. General Conditions:</strong> The vehicle must be maintained in a roadworthy condition. 
          You must take all reasonable steps to safeguard the vehicle from loss or damage.
        </p>
        <p className="mb-4">
          <strong>2. Claims:</strong> In the event of an accident, theft, or damage, you must notify us 
          immediately. No admission of liability or offer of payment should be made without our written consent.
        </p>
        <p className="mb-4">
          <strong>3. Cancellation:</strong> This policy may be cancelled by you at any time. A pro-rata refund 
          will only be issued subject to no claims having been made during the current period of insurance.
        </p>
        <p>
          By signing below, I declare that the particulars provided during this application are true 
          and complete to the best of my knowledge, and I accept the terms and conditions outlined above.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold text-primary mb-4">Your Signature</h3>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button 
            className={`py-2 px-6 font-semibold transition-all ${activeTab === "DRAW" ? "text-primary border-b-2 border-primary" : "text-gray-400 hover:text-gray-600"}`}
            onClick={() => setActiveTab("DRAW")}
          >
            Draw Signature
          </button>
          <button 
            className={`py-2 px-6 font-semibold transition-all ${activeTab === "UPLOAD" ? "text-primary border-b-2 border-primary" : "text-gray-400 hover:text-gray-600"}`}
            onClick={() => setActiveTab("UPLOAD")}
          >
            Upload Image
          </button>
        </div>

        {/* Draw Tab */}
        {activeTab === "DRAW" && (
          <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
            <SignatureCanvas 
              ref={sigCanvas} 
              penColor="black"
              canvasProps={{className: "w-full h-48 cursor-crosshair"}} 
            />
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === "UPLOAD" && (
          <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 p-8 text-center flex flex-col items-center justify-center h-48">
            {uploadedBase64 ? (
              <img src={uploadedBase64} alt="Uploaded Signature" className="max-h-32 mb-4" />
            ) : (
              <div className="text-gray-500 mb-4">Select an image file (PNG, JPG)</div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
            />
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button onClick={handleClear} className="text-gray-500 hover:text-red-500 text-sm font-semibold transition-colors">
            Clear Signature
          </button>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`w-full text-white p-4 rounded-xl font-bold transition-all text-lg shadow-md mt-6 ${
          isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-opacity-90'
        }`}
      >
        {isSubmitting ? "Generating Documents..." : "Submit Signature & Finalize"}
      </button>

    </div>
  );
}

export default function SignPolicy() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <SignPolicyContent />
    </Suspense>
  );
}
