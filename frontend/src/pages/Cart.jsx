import React from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { cart, removeFromCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return <p style={{ padding: 20 }}>Cart is empty</p>;
  }

  async function handleCheckout() {
    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ items: cart }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.msg || "Failed to create order");
        return;
      }

      alert("Order created! ID: " + data.orderId);
      // ممكن نفرّغ الكارت هنا لو حبيتي
      // ...
    } catch (e) {
      alert("Error: " + e.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Cart</h2>

      {cart.map((item) => (
        <div
          key={item.id}
          style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
        >
          <strong>{item.name}</strong>
          <p>Price: ${item.price}</p>
          <button onClick={() => removeFromCart(item.id)}>Remove</button>
        </div>
      ))}

      <button onClick={handleCheckout}>Place Order</button>
    </div>
  );
}
