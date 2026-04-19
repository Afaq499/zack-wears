/** Stylized mark inspired by minimal fashion storefront logos */
export default function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 48" width="34" height="40" aria-hidden>
      <path
        fill="currentColor"
        d="M8 6h24v4H8V6Zm0 10h24v4H8v-4Zm0 10h18l6 10-4 2.4L26 30H8v-4Z"
      />
    </svg>
  );
}
