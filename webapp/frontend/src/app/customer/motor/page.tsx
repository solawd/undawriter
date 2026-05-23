"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MotorInsurance() {
  const router = useRouter();
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
  const [showModal, setShowModal] = useState(false);

  const handleGetQuote = (e: any) => {
    e.preventDefault();
    // Simulate API Call for MVP offline mode
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
    setShowModal(true);
  };

  const proceedToPayment = () => {
    sessionStorage.setItem("motorFormData", JSON.stringify(formData));
    sessionStorage.setItem("motorQuoteData", JSON.stringify(quote));
    router.push("/customer/motor/payment");
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

      {/* Quote Modal */}
      {showModal && quote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-blue-50 p-6 border-b border-blue-100">
              <h2 className="text-2xl font-bold text-primary">Your Quote</h2>
              <p className="text-sm text-gray-500 mt-1">Review your calculated premium.</p>
            </div>
            
            <div className="p-6 space-y-4 text-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-600">Base Premium</span>
                <span className="text-gray-800">{quote.currency} {quote.basePremium}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-600">NIC Levy (1.5%)</span>
                <span className="text-gray-800">{quote.currency} {quote.nicLevy}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-600">Sticker Fee</span>
                <span className="text-gray-800">{quote.currency} {quote.stickerFee}</span>
              </div>
              
              <div className="border-t border-gray-200 my-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-primary">Total Amount</span>
                  <span className="text-2xl font-black text-secondary">{quote.currency} {quote.totalPremium}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-white border border-gray-300 text-gray-700 p-3 rounded-xl font-bold hover:bg-gray-100 transition-all"
              >
                Close
              </button>
              <button
                onClick={proceedToPayment}
                className="flex-1 bg-secondary text-white p-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-md"
              >
                Buy Policy Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
