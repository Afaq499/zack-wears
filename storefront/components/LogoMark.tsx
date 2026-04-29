export default function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="Zack Wears"
      className={className ? `logo-mark-img ${className}` : "logo-mark-img"}
      width={100}
      height={100}
    />
  );
}
