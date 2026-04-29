import type { Metadata } from "next";
import Header from "@/components/Header";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getCategories } from "@/lib/api";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Zack Wears",
    template: "%s · Zack Wears",
  },
  description: "Modern apparel, shoes, and accessories — fast delivery across Pakistan.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
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

  const year = new Date().getFullYear();

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Header categories={categories} />
        {children}
        <footer className="site-footer">
          <div className="container muted" style={{ fontSize: 13, letterSpacing: "0.04em" }}>
            © {year} Zack Wears
          </div>
        </footer>
        <WhatsAppButton />
      </body>
    </html>
  );
}
