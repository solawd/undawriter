"use client";

import { useState } from "react";

export default function TravelInsurance() {
  const [formData, setFormData] = useState({
    passportNumber: "",
    countryOfIssue: "Ghana",
    destinationRegion: "Worldwide",
    tripPurpose: "Tourism / Vacation",
    nextOfKinContact: "",
    preExistingConditions: false,
    tripDays: 14,
    age: 30
  });
  const [quote, setQuote] = useState<any>(null);

  const handleGetQuote = async (e: any) => {
    e.preventDefault();
    
    // Simulate App offline rating logic calculation
    // PRD: (Daily Rate * Days) * Region Multiplier * Age Factor
    const dailyRate = 12.5; // Base daily rate in GHS
    const days = Number(formData.tripDays) || 1;
    
    let regionMultiplier = 1.0;
    if (formData.destinationRegion === "Schengen") regionMultiplier = 1.8;
    if (formData.destinationRegion === "Worldwide") regionMultiplier = 2.5;
    if (formData.destinationRegion === "Africa") regionMultiplier = 1.2;

    let ageFactor = 1.0;
    if (formData.age > 60) ageFactor = 1.5;
    if (formData.age > 75) ageFactor = 2.5;

    let basePremium = (dailyRate * days) * regionMultiplier * ageFactor;
    
    // Add risk loading for pre-existing conditions
    if (formData.preExistingConditions) {
      basePremium *= 1.4;
    }

    setQuote({
      basePremium: basePremium.toFixed(2),
      adminFee: "25.00",
      totalPremium: (basePremium + 25.00).toFixed(2),
      currency: "GHS",
    });
  };

  const handlePurchase = () => {
    alert("Redirecting to Paystack: " + quote.totalPremium + " GHS");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold text-primary mb-2">Travel Insurance</h1>
      <p className="text-gray-500 mb-8">Comprehensive coverage for your international trips.</p>

      <form onSubmit={handleGetQuote} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-secondary font-semibold mb-2">Passport Number</label>
            <input
              type="text"
              value={formData.passportNumber}
              onChange={(e) => setFormData({...formData, passportNumber: e.target.value.toUpperCase()})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none uppercase"
              placeholder="e.g. G1234567"
              required
            />
          </div>
          <div>
            <label className="block text-secondary font-semibold mb-2">Country of Issue</label>
            <input
              type="text"
              value={formData.countryOfIssue}
              onChange={(e) => setFormData({...formData, countryOfIssue: e.target.value})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none"
              placeholder="e.g. Ghana"
              required
            />
          </div>
          <div>
            <label className="block text-secondary font-semibold mb-2">Destination Region</label>
            <select
              value={formData.destinationRegion}
              onChange={(e) => setFormData({...formData, destinationRegion: e.target.value})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none bg-white"
            >
              <option value="Africa">Africa</option>
              <option value="Schengen">Schengen</option>
              <option value="Worldwide">Worldwide</option>
            </select>
          </div>
          <div>
            <label className="block text-secondary font-semibold mb-2">Trip Purpose</label>
            <select
              value={formData.tripPurpose}
              onChange={(e) => setFormData({...formData, tripPurpose: e.target.value})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none bg-white"
            >
              <option value="Tourism / Vacation">Tourism / Vacation</option>
              <option value="Business">Business</option>
              <option value="Study">Study</option>
              <option value="Medical">Medical</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-secondary font-semibold mb-2">Traveler Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none"
              min={1}
              max={100}
              required
            />
          </div>
          <div>
            <label className="block text-secondary font-semibold mb-2">Trip Duration (Days)</label>
            <input
              type="number"
              value={formData.tripDays}
              onChange={(e) => setFormData({...formData, tripDays: Number(e.target.value)})}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none text-gray-800 font-bold"
              min={1}
              max={365}
              required
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="block text-secondary font-semibold mb-2">Next of Kin Contact</label>
          <input
            type="text"
            value={formData.nextOfKinContact}
            onChange={(e) => setFormData({...formData, nextOfKinContact: e.target.value})}
            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none mb-6"
            placeholder="Name & Phone Number"
            required
          />

          <label className="flex items-center space-x-3 cursor-pointer bg-gray-50 p-4 rounded-xl border border-gray-200">
            <input
              type="checkbox"
              checked={formData.preExistingConditions}
              onChange={(e) => setFormData({...formData, preExistingConditions: e.target.checked})}
              className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <span className="text-gray-700 font-medium">I have pre-existing medical conditions</span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white p-4 rounded-xl font-bold hover:bg-opacity-90 transition-all text-lg shadow-md mt-6"
        >
          Calculate Travel Premium
        </button>
      </form>

      {quote && (
        <div className="mt-10 p-6 bg-blue-50 border-l-4 border-secondary rounded-r-xl">
          <h2 className="text-2xl font-bold text-primary mb-4">Your Travel Quote</h2>
          <div className="space-y-2 text-lg">
            <p><span className="font-semibold text-gray-700">Base Premium:</span> {quote.currency} {quote.basePremium}</p>
            <p><span className="font-semibold text-gray-700">Admin/Processing Fee:</span> {quote.currency} {quote.adminFee}</p>
            <div className="border-t-2 border-primary border-opacity-20 my-4 pt-4">
              <p className="text-2xl font-bold text-primary flex justify-between items-center">
                <span>Total Amount Due</span>
                <span>{quote.currency} {quote.totalPremium}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            className="mt-6 w-full bg-secondary text-white p-4 rounded-xl font-bold hover:bg-opacity-90 transition-all text-lg shadow-md"
          >
            Buy Travel Cover Now
          </button>
        </div>
      )}
    </div>
  );
}
