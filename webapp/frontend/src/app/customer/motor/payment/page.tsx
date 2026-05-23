"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function MotorPaymentPage() {
  const router = useRouter();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"MOBILE_MONEY" | "CARD">("MOBILE_MONEY");
  
  const [motorData, setMotorData] = useState<any>(null);
  const [quoteData, setQuoteData] = useState<any>(null);

  const [momoDetails, setMomoDetails] = useState({
    network: "MTN",
    number: "",
    reference: ""
  });

  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: ""
  });

  useEffect(() => {
    const savedMotorData = sessionStorage.getItem("motorFormData");
    const savedQuoteData = sessionStorage.getItem("motorQuoteData");
    
    if (savedMotorData && savedQuoteData) {
      setMotorData(JSON.parse(savedMotorData));
      setQuoteData(JSON.parse(savedQuoteData));
    } else {
      // Redirect back if no data found
      router.push("/customer/motor");
    }
  }, [router]);

  const handlePurchase = async (e: any) => {
    e.preventDefault();
    setIsPurchasing(true);

    try {
      const payload = {
        ...motorData,
        totalPremium: quoteData.totalPremium,
        paymentChannel: paymentMethod,
        ...(paymentMethod === "MOBILE_MONEY" ? {
          mobileNetwork: momoDetails.network,
          mobileNumber: momoDetails.number,
          paymentReference: momoDetails.reference
        } : {
          cardNumber: cardDetails.cardNumber,
        })
      };

      const response = await fetchWithAuth("/api/v1/payments/purchase/motor", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        // Clear session storage on success
        sessionStorage.removeItem("motorFormData");
        sessionStorage.removeItem("motorQuoteData");
        router.push(`/customer/motor/sign?policyId=${data.policyId}`);
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

  if (!motorData || !quoteData) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold text-primary mb-2">Complete Payment</h1>
      <p className="text-gray-500 mb-8">Choose your preferred payment method to activate your policy.</p>

      {/* Summary Box */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8">
        <h3 className="text-lg font-bold text-primary mb-4">Order Summary</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Vehicle Make/Model</span>
          <span className="font-semibold text-gray-800">{motorData.makeModel}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Registration</span>
          <span className="font-semibold text-gray-800">{motorData.regNumber}</span>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-blue-200 mt-4">
          <span className="text-xl font-bold text-primary">Amount to Pay</span>
          <span className="text-2xl font-black text-secondary">{quoteData.currency} {quoteData.totalPremium}</span>
        </div>
      </div>

      <form onSubmit={handlePurchase} className="space-y-6">
        {/* Payment Toggles */}
        <div className="flex space-x-4 mb-6">
          <button
            type="button"
            onClick={() => setPaymentMethod("MOBILE_MONEY")}
            className={`flex-1 p-4 rounded-xl font-bold border-2 transition-all ${
              paymentMethod === "MOBILE_MONEY" 
                ? "border-secondary bg-blue-50 text-secondary" 
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            Mobile Money
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("CARD")}
            className={`flex-1 p-4 rounded-xl font-bold border-2 transition-all ${
              paymentMethod === "CARD" 
                ? "border-secondary bg-blue-50 text-secondary" 
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            Credit/Debit Card
          </button>
        </div>

        {/* Mobile Money Form */}
        {paymentMethod === "MOBILE_MONEY" && (
          <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div>
              <label className="block text-secondary font-semibold mb-2">Select Network</label>
              <select
                value={momoDetails.network}
                onChange={(e) => setMomoDetails({...momoDetails, network: e.target.value})}
                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none bg-white"
                required
              >
                <option value="MTN">MTN</option>
                <option value="Telecel">Telecel</option>
                <option value="AT">AT</option>
              </select>
            </div>
            <div>
              <label className="block text-secondary font-semibold mb-2">Mobile Number</label>
              <input
                type="tel"
                value={momoDetails.number}
                onChange={(e) => setMomoDetails({...momoDetails, number: e.target.value})}
                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none"
                placeholder="e.g. 0244123456"
                required
              />
            </div>
            <div>
              <label className="block text-secondary font-semibold mb-2">Payment Reference</label>
              <input
                type="text"
                value={momoDetails.reference}
                onChange={(e) => setMomoDetails({...momoDetails, reference: e.target.value})}
                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none"
                placeholder="Optional"
              />
            </div>
          </div>
        )}

        {/* Card Form */}
        {paymentMethod === "CARD" && (
          <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div>
              <label className="block text-secondary font-semibold mb-2">Card Number</label>
              <input
                type="text"
                value={cardDetails.cardNumber}
                onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none"
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                required
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-secondary font-semibold mb-2">Expiry Date</label>
                <input
                  type="text"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none"
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-secondary font-semibold mb-2">CVV</label>
                <input
                  type="password"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-primary focus:outline-none"
                  placeholder="***"
                  maxLength={4}
                  required
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isPurchasing}
          className={`w-full text-white p-4 rounded-xl font-bold transition-all text-lg shadow-md mt-6 ${
            isPurchasing ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-opacity-90'
          }`}
        >
          {isPurchasing ? "Processing Payment..." : `Pay ${quoteData.currency} ${quoteData.totalPremium}`}
        </button>
      </form>
    </div>
  );
}
