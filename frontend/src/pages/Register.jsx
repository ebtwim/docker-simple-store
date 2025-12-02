import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    const res = await fetch("http://localhost:4000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    if (!res.ok) return setMsg(data.msg);

    navigate("/verify-otp", { state: { email: form.email } });
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h2 className="text-xl font-bold mb-4">Register</h2>

      {msg && <p className="text-red-500">{msg}</p>}

      <input placeholder="Name" className="border p-2 block" 
        onChange={e => setForm({...form, name: e.target.value})} />

      <input placeholder="Email" className="border p-2 block"
        onChange={e => setForm({...form, email: e.target.value})} />

      <input placeholder="Password" type="password"
        className="border p-2 block"
        onChange={e => setForm({...form, password: e.target.value})} />

      <button className="bg-blue-600 text-white px-4 py-2 mt-3">
        Register
      </button>
    </form>
  );
}
