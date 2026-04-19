import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <main className="container" style={{ padding: "2.5rem 0 3rem", maxWidth: 480 }}>
      <h1 style={{ marginTop: 0, fontSize: "1.35rem", letterSpacing: "0.06em" }}>Account</h1>
      <p className="muted" style={{ fontSize: "0.92rem" }}>
        Customer accounts are not wired to this demo storefront yet. Use the admin portal to manage orders.
      </p>
      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/">← Back to shop</Link>
      </p>
    </main>
  );
}
