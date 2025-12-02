import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">
        <Link to="/">Simple Store</Link>
      </h1>

      <div className="flex items-center gap-4">
        <Link to="/" className="hover:text-slate-300">
          Products
        </Link>

        <Link to="/cart" className="hover:text-slate-300">
          Cart ({cart.length})
        </Link>

        {/* 🔑 المستخدم غير مسجّل */}
        {!user && (
          <>
            <Link
              to="/login"
              className="px-3 py-1 rounded hover:text-slate-300"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
            >
              Register
            </Link>
          </>
        )}

        {/* ✅ المستخدم مسجّل */}
        {user && (
          <>
            <span className="text-sm opacity-90">
              Hi, {user.name || user.email}
            </span>

            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
