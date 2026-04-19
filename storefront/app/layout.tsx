import type { Metadata } from "next";
import Header from "@/components/Header";
import { getCategories } from "@/lib/api";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Zack Wears",
    template: "%s · Zack Wears",
  },
  description: "Modern apparel and accessories with fast delivery across Pakistan.",
  openGraph: {
    type: "website",
    siteName: "Zack Wears",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  return (
    <html lang="en">
      <body>
        <Header categories={categories} />
        {children}
        <footer style={{ borderTop: "1px solid var(--border)", marginTop: "3rem", padding: "2rem 0" }}>
          <div className="container muted" style={{ fontSize: 14 }}>
            © {new Date().getFullYear()} Zack Wears
          </div>
        </footer>
      </body>
    </html>
  );
}
