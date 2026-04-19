import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <h1 style={{ marginTop: 0 }}>Page not found</h1>
      <p className="muted">The page you are looking for does not exist.</p>
      <Link href="/">Go home</Link>
    </main>
  );
}
