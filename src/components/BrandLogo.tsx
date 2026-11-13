// Logo do radar: os círculos são o alcance e o ponto é o cliente encontrado
export function BrandLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      <rect width="120" height="120" rx="28" fill="#0e6b57" />
      <circle
        cx="60"
        cy="60"
        r="40"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.35"
        strokeWidth="5"
      />
      <circle
        cx="60"
        cy="60"
        r="24"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.35"
        strokeWidth="5"
      />
      <path
        d="M60 60 L60 20 A40 40 0 0 1 94.64 40 Z"
        fill="#fff"
        fillOpacity="0.22"
      />
      <path
        d="M60 60 L60 20"
        stroke="#fff"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="74" cy="37" r="9" fill="#9ff0c9" />
      <circle cx="60" cy="60" r="6" fill="#fff" />
    </svg>
  );
}
