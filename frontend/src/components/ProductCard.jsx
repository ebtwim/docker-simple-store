import React from "react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
      <h4>{product.name}</h4>
      <p>Price: ${product.price}</p>
      <button onClick={() => addToCart(product)}>
        Add to cart
      </button>
    </div>
  );
}
