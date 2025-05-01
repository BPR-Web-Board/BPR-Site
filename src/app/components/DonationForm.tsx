"use client";

import { useState } from "react";

export default function DonationForm() {
  const [frequency, setFrequency] = useState<"monthly" | "one-time">("monthly");
  const [amount, setAmount] = useState<string>("30");
  const [name, setName] = useState<string>("");

  const handleFrequencyChange = (newFrequency: "monthly" | "one-time") => {
    setFrequency(newFrequency);
  };

  const handleAmountChange = (newAmount: string) => {
    setAmount(newAmount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ frequency, amount, name });
    // In a real application, this would connect to a payment processor
    alert(`Donation submitted: ${frequency} payment of $${amount}`);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-md">
      <div>
        <p className="mb-2 font-medium">Select gift frequency</p>
        <div className="flex overflow-hidden bg-gray-200 rounded-full">
          <button
            className={`flex-1 py-3 px-6 text-sm font-medium ${
              frequency === "monthly" ? "bg-gray-500 text-white" : ""
            }`}
            onClick={() => handleFrequencyChange("monthly")}
            type="button"
          >
            Monthly
          </button>
          <button
            className={`flex-1 py-3 px-6 text-sm font-medium ${
              frequency === "one-time" ? "bg-gray-500 text-white" : ""
            }`}
            onClick={() => handleFrequencyChange("one-time")}
            type="button"
          >
            One Time
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 font-medium">Select amount (in US dollar)</p>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-5 py-2 border border-gray-300 rounded-full text-sm ${
              amount === "10" ? "bg-gray-500 text-white border-gray-500" : ""
            }`}
            onClick={() => handleAmountChange("10")}
            type="button"
          >
            10$
          </button>
          <button
            className={`px-5 py-2 border border-gray-300 rounded-full text-sm ${
              amount === "20" ? "bg-gray-500 text-white border-gray-500" : ""
            }`}
            onClick={() => handleAmountChange("20")}
            type="button"
          >
            20$
          </button>
          <button
            className={`px-5 py-2 border border-gray-300 rounded-full text-sm ${
              amount === "30" ? "bg-gray-500 text-white border-gray-500" : ""
            }`}
            onClick={() => handleAmountChange("30")}
            type="button"
          >
            30$
          </button>
          <button
            className={`px-5 py-2 border border-gray-300 rounded-full text-sm ${
              amount === "40" ? "bg-gray-500 text-white border-gray-500" : ""
            }`}
            onClick={() => handleAmountChange("40")}
            type="button"
          >
            40$
          </button>
          <button
            className={`px-5 py-2 border border-gray-300 rounded-full text-sm ${
              amount === "other" ? "bg-gray-500 text-white border-gray-500" : ""
            }`}
            onClick={() => handleAmountChange("other")}
            type="button"
          >
            Other
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 font-medium">Name</p>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded"
        />
      </div>

      <button
        className="w-full py-4 bg-black text-white font-medium"
        onClick={handleSubmit}
        type="submit"
      >
        Donate now
      </button>
    </div>
  );
}
