import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function IconSearch(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16.5 16.5L21 21" strokeLinecap="round" />
    </svg>
  );
}

export function IconUser(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden {...props}>
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
      <path d="M5 20a7 7 0 0 1 14 0" strokeLinecap="round" />
    </svg>
  );
}

export function IconCart(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <circle cx="9" cy="20" r="1" />
      <circle cx="20" cy="20" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
