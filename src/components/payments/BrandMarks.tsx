import type { SVGProps } from "react";

type MarkProps = SVGProps<SVGSVGElement> & { compact?: boolean };

export function VisaMark({ className, ...props }: MarkProps) {
  return (
    <svg viewBox="0 0 72 24" role="img" aria-label="Visa" className={className} {...props}>
      <path fill="currentColor" d="M28.7 20.2h-5.8L26.5 3.8h5.8l-3.6 16.4Zm21-16c-1.1-.4-2.9-.9-5.1-.9-5.7 0-9.7 2.8-9.7 6.9 0 3 2.9 4.7 5.1 5.7 2.3 1 3 1.7 3 2.6 0 1.3-1.8 2-3.4 2-2.3 0-3.5-.3-5.4-1l-.8-.3-.8 4.7c1.4.5 3.9 1 6.5 1 6 0 10-2.8 10-7.1 0-2.4-1.5-4.2-4.8-5.7-2-.9-3.2-1.5-3.2-2.5 0-.8 1-1.7 3.2-1.7 1.9 0 3.2.4 4.3.8l.5.2.8-4.7ZM64.4 3.8h-4.5c-1.4 0-2.4.4-3 1.9l-8.6 14.5h6l1.2-3.1h7.3l.7 3.1h5.3L64.4 3.8Zm-7.2 9.1 3-7.3 1.7 7.3h-4.7ZM18.2 3.8l-5.6 11.2-.6-2.8C10.9 8.9 7.8 5.4 4.3 3.7L9.4 20h6.1l8.9-16.2h-6.2Z" />
      <path fill="#F7B600" d="M7.6 3.8H-1l-.1.4C5.6 5.8 10 9.6 12 14.2L10 5.8c-.3-1.5-1.3-2-2.4-2Z" />
    </svg>
  );
}

export function MastercardMark({ className, compact = false, ...props }: MarkProps) {
  return (
    <svg viewBox={compact ? "0 0 48 30" : "0 0 92 30"} role="img" aria-label="Mastercard" className={className} {...props}>
      <circle cx="18" cy="15" r="14" fill="#EB001B" />
      <circle cx="34" cy="15" r="14" fill="#F79E1B" />
      <path fill="#FF5F00" d="M26 3.8a14 14 0 0 1 0 22.4 14 14 0 0 1 0-22.4Z" />
      {!compact && <text x="53" y="19" fill="currentColor" fontSize="10" fontWeight="700" fontFamily="Arial, sans-serif">mastercard</text>}
    </svg>
  );
}

export function StripeMark({ className, ...props }: MarkProps) {
  return (
    <svg viewBox="0 0 74 30" role="img" aria-label="Stripe" className={className} {...props}>
      <text x="1" y="22" fill="currentColor" fontSize="25" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="-1.7">stripe</text>
    </svg>
  );
}

export function MercadoPagoMark({ className, compact = false, ...props }: MarkProps) {
  return (
    <svg viewBox={compact ? "0 0 42 30" : "0 0 126 30"} role="img" aria-label="Mercado Pago" className={className} {...props}>
      <ellipse cx="20" cy="15" rx="19" ry="13" fill="#009EE3" />
      <path d="M8 14.2c3.1-4 6.1-4.8 8.8-2.5l2 1.7 2.3-2c2.5-2.1 5.6-1.2 9 2.8M10 16.3c2.7 3.2 5.1 3.4 7.4.9l1.4-1.5 1.5 1.5c2.4 2.5 5 2.3 8-.9" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {!compact && <text x="44" y="13" fill="currentColor" fontSize="10.5" fontWeight="700" fontFamily="Arial, sans-serif">mercado</text>}
      {!compact && <text x="44" y="24" fill="currentColor" fontSize="10.5" fontWeight="700" fontFamily="Arial, sans-serif">pago</text>}
    </svg>
  );
}
