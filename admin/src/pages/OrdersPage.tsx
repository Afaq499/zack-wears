import { useEffect, useState } from "react";
import { api } from "../api";
import type { Order } from "../types";

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"] as const;

export default function OrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const data = await api<Order[]>("/api/orders");
    setItems(data);
  }

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  async function setStatus(id: string, status: string) {
    setError(null);
    try {
      await api(`/api/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Orders</h1>
      {error ? <p style={{ color: "#b00020" }}>{error}</p> : null}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o._id}>
                <td>
                  <strong>{o.orderNumber}</strong>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {o.lineItems.length} item(s)
                  </div>
                </td>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
                <td>{o.shipping.email}</td>
                <td>
                  {o.currency} {o.total}
                </td>
                <td>
                  <select value={o.status} onChange={(e) => setStatus(o._id, e.target.value)}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
