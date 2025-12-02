import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

export default function Products() {
  const [data, setData] = useState({ items: [], page: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load(page = 1) {
    setLoading(true);
    fetch(`http://localhost:4000/api/products?page=${page}&limit=2`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }

  useEffect(() => {
    load(1);
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Loading products...</p>;
  if (error) return <p style={{ padding: 20 }}>Error: {error}</p>;

  const { items, page, total, limit } = data;
  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ padding: 20 }}>
      <h2>Products</h2>

      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}

      <div style={{ marginTop: 10 }}>
        <button disabled={page <= 1} onClick={() => load(page - 1)}>
          Prev
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {page} / {totalPages}
        </span>
        <button disabled={page >= totalPages} onClick={() => load(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
