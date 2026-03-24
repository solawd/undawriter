"use client";

import { useState } from "react";

export default function HomeInsurance() {
  const [formData, setFormData] = useState({
    ghanaPostGps: "",
    propertyType: "",
    wallMaterial: "Sandcrete Blocks",
    roofMaterial: "Aluminum Sheets",
    occupancy: "Owner Occupied",
    sumInsuredBuilding: "",
    sumInsuredContents: ""
  });
  const [quote, setQuote] = useState<any>(null);

  const handleGetQuote = async (e: any) => {
    e.preventDefault();
    
    // Simulate App offline rating logic calculation
    const buildingValue = parseFloat(formData.sumInsuredBuilding) || 0;
    const contentsValue = parseFloat(formData.sumInsuredContents) || 0;
    
    // Base rate for home is 0.15% of total sum insured
    let basePremium = (buildingValue + contentsValue) * 0.0015;
    
    // Add modifiers
    if (formData.wallMaterial === "Timber / Wood") basePremium *= 1.5; // High fire risk
    if (formData.roofMaterial === "Thatch / Leaves") basePremium *= 2.0;

    const fireServiceLevy = basePremium * 0.02; // 2% Fire levy
    const total = basePremium + fireServiceLevy;

    setQuote({
      basePremium: basePremium.toFixed(2),
      fireServiceLevy: fireServiceLevy.toFixed(2),
      totalPremium: total.toFixed(2),
      currency: "GHS",
    });
  };

  const handlePurchase = () => {
    alert("Redirecting to Paystack: " + quote.totalPremium + " GHS");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold text-primary mb-2">Home Insurance</h1>
      <p className="text-gray-500 mb-8">Protect your property against fire, theft, and natural disasters.</p>

      <form onSubmit={handleGetQuote} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-secondary font-semibold mb-2">Ghana Post GPS Address</label>
            <input
              type="text"
              value={formData.ghanaPostGps}
              onChange={(e) => setFormData({...formData, ghanaPostGps: e.target.value})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none"
              placeholder="e.g. GA-183-8164"
              required
            />
          </div>
          <div>
            <label className="block text-secondary font-semibold mb-2">Property Type</label>
            <select
              value={formData.propertyType}
              onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none bg-white"
              required
            >
              <option value="">Select Property Type</option>
              <option value="Detached House">Detached House</option>
              <option value="Semi-Detached House">Semi-Detached House</option>
              <option value="Apartment / Flat">Apartment / Flat</option>
              <option value="Townhouse">Townhouse</option>
            </select>
          </div>
          <div>
            <label className="block text-secondary font-semibold mb-2">Wall Material</label>
            <select
              value={formData.wallMaterial}
              onChange={(e) => setFormData({...formData, wallMaterial: e.target.value})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none bg-white"
            >
              <option value="Sandcrete Blocks">Sandcrete Blocks</option>
              <option value="Brick">Brick</option>
              <option value="Timber / Wood">Timber / Wood</option>
              <option value="Mud / Wattle">Mud / Wattle</option>
            </select>
          </div>
          <div>
            <label className="block text-secondary font-semibold mb-2">Roof Material</label>
            <select
              value={formData.roofMaterial}
              onChange={(e) => setFormData({...formData, roofMaterial: e.target.value})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none bg-white"
            >
              <option value="Aluminum Sheets">Aluminum Sheets</option>
              <option value="Tiles">Roofing Tiles</option>
              <option value="Concrete">Concrete</option>
              <option value="Asbestos Sheets">Asbestos Sheets</option>
              <option value="Thatch / Leaves">Thatch / Leaves</option>
            </select>
          </div>
          <div>
            <label className="block text-secondary font-semibold mb-2">Occupancy</label>
            <select
              value={formData.occupancy}
              onChange={(e) => setFormData({...formData, occupancy: e.target.value})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none bg-white"
            >
              <option value="Owner Occupied">Owner Occupied</option>
              <option value="Rented Out">Rented Out</option>
              <option value="Unoccupied">Unoccupied</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
          <div>
            <label className="block text-secondary font-semibold mb-2">Sum Insured: Building (GHS)</label>
            <input
              type="number"
              value={formData.sumInsuredBuilding}
              onChange={(e) => setFormData({...formData, sumInsuredBuilding: e.target.value})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none text-lg font-bold"
              placeholder="e.g. 500000"
              required
            />
          </div>
          <div>
            <label className="block text-secondary font-semibold mb-2">Sum Insured: Contents (GHS)</label>
            <input
              type="number"
              value={formData.sumInsuredContents}
              onChange={(e) => setFormData({...formData, sumInsuredContents: e.target.value})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none text-lg font-bold"
              placeholder="e.g. 100000"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white p-4 rounded-xl font-bold hover:bg-opacity-90 transition-all text-lg shadow-md mt-6"
        >
          Calculate Home Premium
        </button>
      </form>

      {quote && (
        <div className="mt-10 p-6 bg-blue-50 border-l-4 border-secondary rounded-r-xl">
          <h2 className="text-2xl font-bold text-primary mb-4">Your Comprehensive Home Quote</h2>
          <div className="space-y-2 text-lg">
            <p><span className="font-semibold text-gray-700">Base Premium:</span> {quote.currency} {quote.basePremium}</p>
            <p><span className="font-semibold text-gray-700">Fire Service Levy (2%):</span> {quote.currency} {quote.fireServiceLevy}</p>
            <div className="border-t-2 border-primary border-opacity-20 my-4 pt-4">
              <p className="text-2xl font-bold text-primary flex justify-between items-center">
                <span>Total Annual Premium</span>
                <span>{quote.currency} {quote.totalPremium}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            className="mt-6 w-full bg-secondary text-white p-4 rounded-xl font-bold hover:bg-opacity-90 transition-all text-lg shadow-md"
          >
            Purchase Home Complete Policy
          </button>
        </div>
      )}
    </div>
  );
}
