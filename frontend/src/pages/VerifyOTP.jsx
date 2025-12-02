import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyOTP() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  async function verify() {
    const res = await fetch("http://localhost:4000/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: state.email, otp })
    });

    const data = await res.json();
    if (!res.ok) return setMsg(data.msg);

    navigate("/login");
  }

  return (
    <div className="p-6">
      <h2>Verify OTP</h2>
      {msg && <p className="text-red-500">{msg}</p>}

      <input
        placeholder="Enter OTP"
        className="border p-2"
        onChange={e => setOtp(e.target.value)}
      />

      <button onClick={verify} className="bg-green-600 text-white px-4 py-2">
        Verify
      </button>
    </div>
  );
}
