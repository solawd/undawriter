"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import Image from "next/image";

function PolicyReceiptContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchWithAuth(`/api/v1/policies/${id}`)
        .then(res => res.json())
        .then(data => {
          setData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading policy details...</div>;
  if (!data || !data.policy) return <div className="p-8 text-center text-red-500">Policy not found or access denied.</div>;

  const { policy, motorDetails } = data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-3xl font-bold text-primary">Policy Receipt</h1>
        <button 
          onClick={handlePrint}
          className="bg-secondary text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-sm"
        >
          <span>🖨️</span> Print Sticker
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6 print:w-full">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Policy Information</h2>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <p className="text-gray-500">Policy Number</p>
              <p className="font-semibold text-right">POL-{policy.id.toString().padStart(6, '0')}</p>
              
              <p className="text-gray-500">Product Type</p>
              <p className="font-semibold text-right">{policy.productType}</p>
              
              <p className="text-gray-500">Status</p>
              <p className="font-semibold text-right text-green-600">{policy.status}</p>

              <p className="text-gray-500">Start Date</p>
              <p className="font-semibold text-right">{policy.startDate}</p>

              <p className="text-gray-500">End Date</p>
              <p className="font-semibold text-right">{policy.endDate}</p>

              <p className="text-gray-500">Premium Paid</p>
              <p className="font-semibold text-right">GHS {policy.premiumNet}</p>
            </div>
          </div>

          {motorDetails && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:block">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Motor Specifics</h2>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <p className="text-gray-500">Registration Number</p>
                <p className="font-semibold text-right">{motorDetails.regNumber}</p>
                
                <p className="text-gray-500">Make & Model</p>
                <p className="font-semibold text-right">{motorDetails.makeModel} ({motorDetails.year})</p>
                
                <p className="text-gray-500">Chassis Number</p>
                <p className="font-semibold text-right font-mono text-xs mt-1">{motorDetails.chassisNumber}</p>
                
                <p className="text-gray-500">Usage & Coverage</p>
                <p className="font-semibold text-right">{motorDetails.usage} / {motorDetails.coverageType.replace("_", " ")}</p>

                <p className="text-gray-500">Sum/Value Insured</p>
                <p className="font-semibold text-right">GHS {motorDetails.sumInsured}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Printable Sticker */}
        <div className="lg:col-span-1 print:fixed print:top-0 print:right-0 print:w-[350px] print:m-4">
          {policy.productType === 'MOTOR' && policy.nicStickerId && (
            <div className="bg-white border-2 border-black p-1 rounded-sm shadow-lg relative print:shadow-none font-sans relative overflow-hidden">
              <div className="border border-black w-full h-full p-4 relative pb-6 z-10">
                
                {/* Background Watermark Layer */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none w-48 h-48 rounded-full border-[10px] border-double border-gray-400 flex items-center justify-center -z-10">
                    <span className="font-bold text-gray-500 text-3xl tracking-widest absolute">NIC</span>
                    <div className="w-[120%] h-[120%] rounded-full border border-dashed border-gray-300 absolute"></div>
                </div>

                <div className="text-center mb-6">
                  <h3 className="font-bold text-lg text-black leading-tight">UndaWriter Insurance Limited</h3>
                  <p className="font-bold text-sm text-black">NATIONAL INSURANCE COMMISSION</p>
                </div>
                
                <div className="flex justify-between items-center mb-6">
                  <div className="space-y-1 text-[13px] text-black">
                    <div className="flex">
                      <span className="w-16">Car No. <span className="float-right">:</span></span>
                      <span className="font-bold ml-2">{motorDetails?.regNumber}</span>
                    </div>
                    <div className="flex">
                      <span className="w-16">Make <span className="float-right">:</span></span>
                      <span className="font-bold ml-2 truncate w-24">{motorDetails?.makeModel.split(" ")[0] || motorDetails?.makeModel}</span>
                    </div>
                    <div className="flex">
                      <span className="w-16">Model <span className="float-right">:</span></span>
                      <span className="font-bold ml-2 truncate w-24">{motorDetails?.makeModel.split(" ").slice(1).join(" ") || motorDetails?.year}</span>
                    </div>
                    <div className="flex">
                      <span className="w-16">Body <span className="float-right">:</span></span>
                      <span className="font-bold ml-2">{motorDetails?.bodyType}</span>
                    </div>
                  </div>

                  {/* QR Code Placeholder */}
                  <div className="w-20 h-20 bg-gray-100 flex items-center justify-center p-1 border border-gray-200 self-center shrink-0">
                    <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://undawriter.com/verify')] bg-cover"></div>
                  </div>
                </div>

                <div className="space-y-1 text-[13px] text-black border-t border-black pt-4">
                  <div className="flex">
                    <span className="w-28">Inception Date <span className="float-right">:</span></span>
                    <span className="font-bold ml-2 uppercase">{new Date(policy.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/ /g, ' ')}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28">Expiry Date <span className="float-right">:</span></span>
                    <span className="font-bold ml-2 uppercase">{new Date(policy.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/ /g, ' ')}</span>
                  </div>
                  <div className="flex pt-3 mt-1 text-sm">
                    <span className="w-28">Sticker Number <span className="float-right">:</span></span>
                    <span className="font-bold ml-2 font-mono tracking-wider">{policy.nicStickerId}</span>
                  </div>
                </div>
                
              </div>
            </div>
          )}
          
          <div className="mt-4 text-xs text-gray-400 text-center print:hidden">
            <p>Ensure your browser is set to print background graphics for the best sticker output.</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:fixed, .print\\:fixed * {
            visibility: visible;
          }
          /* Hide the layout sidebar */
          aside, nav {
            display: none !important;
          }
          /* Reset margins */
          main {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}} />
    </div>
  );
}

export default function PolicyReceipt() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <PolicyReceiptContent />
    </Suspense>
  );
}
