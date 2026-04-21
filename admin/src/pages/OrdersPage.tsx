import { useEffect, useState } from "react";
import { api } from "../api";
import type { Order } from "../types";

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"] as const;

export default function OrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  function displayLineName(li: Order["lineItems"][number]) {
    const n = (li.name || "").trim();
    if (n) return n;
    const s = (li.slug || "").trim();
    if (s) return s;
    return li.productId;
  }

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
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => {
              const isOpen = openOrderId === o._id;
              const detailsId = `order-${o._id}-items`;
              return (
                <>
                  <tr key={o._id}>
                    <td>
                      <strong>{o.orderNumber}</strong>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {o.lineItems.length} item(s)
                      </div>
                    </td>
                    <td>{new Date(o.createdAt).toLocaleString()}</td>
                    <td>{o.shipping.email}</td>
                    <td style={{ minWidth: 220 }}>
                      <button
                        type="button"
                        className="btn secondary"
                        aria-expanded={isOpen}
                        aria-controls={detailsId}
                        onClick={() => setOpenOrderId((prev) => (prev === o._id ? null : o._id))}
                        style={{ padding: "0.35rem 0.6rem" }}
                      >
                        {isOpen ? "Hide items" : "Show items"}
                      </button>
                      {o.lineItems[0] ? (
                        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                          {displayLineName(o.lineItems[0])}
                          {o.lineItems.length > 1 ? ` +${o.lineItems.length - 1} more` : ""}
                        </div>
                      ) : null}
                    </td>
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

                  {isOpen ? (
                    <tr>
                      <td colSpan={6} style={{ background: "#fafafa" }}>
                        <div id={detailsId} style={{ padding: "0.75rem 0.5rem" }}>
                          <div style={{ display: "grid", gap: 10 }}>
                            {o.lineItems.map((li, idx) => (
                              <div
                                key={`${o._id}-li-${idx}`}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                  padding: "0.5rem",
                                  background: "#fff",
                                  border: "1px solid #eee",
                                  borderRadius: 10,
                                }}
                              >
                                {li.image ? (
                                  <img
                                    src={li.image}
                                    alt=""
                                    width={52}
                                    height={52}
                                    style={{ borderRadius: 10, objectFit: "cover", background: "#eee", flex: "0 0 auto" }}
                                  />
                                ) : (
                                  <div style={{ width: 52, height: 52, background: "#eee", borderRadius: 10, flex: "0 0 auto" }} />
                                )}

                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {displayLineName(li)}
                                  </div>
                                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                                    Qty {li.quantity}
                                    {li.color ? ` · ${li.color}` : ""}
                                    {li.size ? ` · ${li.size}` : ""}
                                  </div>
                                </div>

                                <div style={{ textAlign: "right", flex: "0 0 auto" }}>
                                  <div style={{ fontWeight: 700 }}>
                                    {o.currency} {li.unitPrice * li.quantity}
                                  </div>
                                  <div className="muted" style={{ fontSize: 12 }}>
                                    {o.currency} {li.unitPrice} each
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
