"use client";

import { useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function MotorInsurance() {
  const router = useRouter();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [formData, setFormData] = useState({
    regNumber: "",
    chassisNumber: "",
    makeModel: "",
    year: "",
    bodyType: "",
    seatingCapacity: "",
    usage: "Private",
    coverageType: "Comprehensive",
    sumInsured: "",
    durationMonths: 12
  });
  const [quote, setQuote] = useState<any>(null);

  const handleGetQuote = async (e: any) => {
    e.preventDefault();
    // Simulate API Call for MVP offline mode
    // In production, fetch API: /api/v1/quotes/calculate
    // Pro-rate the premium based on the selected duration
    const annualBasePremium = parseFloat(formData.sumInsured) * (formData.coverageType === "Comprehensive" ? 0.05 : 0.02);
    const basePremium = annualBasePremium * (formData.durationMonths / 12);
    const nicLevy = basePremium * 0.015;
    const total = basePremium + nicLevy + 1.5;

    setQuote({
      basePremium: basePremium.toFixed(2),
      nicLevy: nicLevy.toFixed(2),
      stickerFee: "1.50",
      totalPremium: total.toFixed(2),
      currency: "GHS",
    });
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const response = await fetchWithAuth("/api/v1/payments/purchase/motor", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          totalPremium: quote.totalPremium
        })
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/customer/policies/receipt?id=${data.policyId}`); // Redirect to receipt page using Next.js router
      } else {
        alert("Failed to purchase policy. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during purchase.");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold text-primary mb-2">Motor Insurance</h1>
      <p className="text-gray-500 mb-8">Get an instant quote for your vehicle in Ghana.</p>

      <form onSubmit={handleGetQuote} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-secondary font-semibold mb-2">Registration Number</label>
            <input
              type="text"
              value={formData.regNumber}
              onChange={(e) => setFormData({...formData, regNumber: e.target.value})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none"
              placeholder="e.g. GT-1234-21"
              required
            />
          </div>
          <div>
            <label className="block text-secondary font-semibold mb-2">Chassis Number</label>
            <input
              type="text"
              value={formData.chassisNumber}
              onChange={(e) => setFormData({...formData, chassisNumber: e.target.value.toUpperCase()})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none uppercase"
              placeholder="17 Character VIN"
              minLength={17}
              maxLength={17}
              required
            />
          </div>
          <div>
            <label className="block text-secondary font-semibold mb-2">Make & Model</label>
            <input
              type="text"
              value={formData.makeModel}
              onChange={(e) => setFormData({...formData, makeModel: e.target.value})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none"
              placeholder="e.g. Toyota Camry"
              required
            />
          </div>
          <div>
            <label className="block text-secondary font-semibold mb-2">Year of Manufacture</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({...formData, year: e.target.value})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none"
              placeholder="YYYY"
              min={1990}
              max={new Date().getFullYear()}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-secondary font-semibold mb-2">Body Type</label>
            <select
              value={formData.bodyType}
              onChange={(e) => setFormData({...formData, bodyType: e.target.value})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none bg-white"
              required
            >
              <option value="">Select Body Type</option>
              <option value="Saloon">Saloon (Sedan)</option>
              <option value="SUV">SUV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Pick-up">Pick-up</option>
              <option value="Minivan">Minivan</option>
            </select>
          </div>
          <div>
            <label className="block text-secondary font-semibold mb-2">Seating Capacity</label>
            <input
              type="number"
              value={formData.seatingCapacity}
              onChange={(e) => setFormData({...formData, seatingCapacity: e.target.value})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none"
              placeholder="e.g. 5"
              min={2}
              max={60}
              required
            />
          </div>
          <div>
            <label className="block text-secondary font-semibold mb-2">Usage</label>
            <select
              value={formData.usage}
              onChange={(e) => setFormData({...formData, usage: e.target.value})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none bg-white"
            >
              <option value="Private">Private</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
          <div>
            <label className="block text-secondary font-semibold mb-2">Coverage Type</label>
            <select
              value={formData.coverageType}
              onChange={(e) => setFormData({...formData, coverageType: e.target.value})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none bg-white"
            >
              <option value="Comprehensive">Comprehensive</option>
              <option value="Third Party">Third Party Only</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-secondary font-semibold mb-2">Duration (Months)</label>
            <select
              value={formData.durationMonths}
              onChange={(e) => setFormData({...formData, durationMonths: Number(e.target.value)})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none bg-white font-bold"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i + 1 === 1 ? 'Month' : 'Months'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-secondary font-semibold mb-2">Sum Insured / Vehicle Value (GHS)</label>
            <input
              type="number"
              value={formData.sumInsured}
              onChange={(e) => setFormData({...formData, sumInsured: e.target.value})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none text-xl font-bold text-gray-800"
              placeholder="e.g. 50000"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white p-4 rounded-xl font-bold hover:bg-opacity-90 transition-all text-lg shadow-md"
        >
          Calculate Premium
        </button>
      </form>

      {quote && (
        <div className="mt-10 p-6 bg-blue-50 border-l-4 border-secondary rounded-r-xl">
          <h2 className="text-2xl font-bold text-primary mb-4">Your Quote</h2>
          <div className="space-y-2 text-lg">
            <p><span className="font-semibold text-gray-700">Base Premium:</span> {quote.currency} {quote.basePremium}</p>
            <p><span className="font-semibold text-gray-700">NIC Levy (1.5%):</span> {quote.currency} {quote.nicLevy}</p>
            <p><span className="font-semibold text-gray-700">Sticker Fee:</span> {quote.currency} {quote.stickerFee}</p>
            <div className="border-t-2 border-primary border-opacity-20 my-4 pt-4">
              <p className="text-2xl font-bold text-primary flex justify-between items-center">
                <span>Total Amount</span>
                <span>{quote.currency} {quote.totalPremium}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={isPurchasing}
            className={`mt-6 w-full text-white p-4 rounded-xl font-bold transition-all text-lg shadow-md ${
              isPurchasing ? 'bg-gray-400 cursor-not-allowed' : 'bg-secondary hover:bg-opacity-90'
            }`}
          >
            {isPurchasing ? "Processing Purchase..." : "Buy Policy Now"}
          </button>
        </div>
      )}
    </div>
  );
}
