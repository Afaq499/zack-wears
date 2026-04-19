"use client";

const defaultMsg = encodeURIComponent("Hi — I have a question about an order.");

export default function WhatsAppButton() {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_E164?.replace(/\D/g, "");
  const href = raw ? `https://wa.me/${raw}?text=${defaultMsg}` : `https://wa.me/?text=${defaultMsg}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="wa-fab"
      aria-label="Chat on WhatsApp"
      title="WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinejoin="round" aria-hidden>
        <path d="M21 11.5a8.5 8.5 0 0 1-9 8.4h-.2l-3.5 1.2 1.2-3.2a8.5 8.5 0 1 1 11.5-6.4Z" />
        <path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" strokeLinecap="round" />
      </svg>
    </a>
  );
}
