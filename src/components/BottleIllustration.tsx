// בקבוקון סרום עם טפטפת — האיור החוזר ל"כל בקבוקון בזמן שלו". טיפה אחת
// יורדת מהטפטפת מדי כמה שניות; זו התנועה היחידה שקשורה בפועל למוצר
// (מריחת סרום), לא אנימציה דקורטיבית.
export default function BottleIllustration({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 140"
      className={className}
      aria-hidden
      role="presentation"
    >
      <g className="skn-animate-float">
        {/* נוזל בתוך הבקבוק */}
        <clipPath id="skn-bottle-clip">
          <rect x="22" y="44" width="56" height="72" rx="18" />
        </clipPath>
        <rect
          x="22"
          y="92"
          width="56"
          height="24"
          className="fill-skn-peach/35"
          clipPath="url(#skn-bottle-clip)"
        />

        {/* גוף הבקבוק */}
        <rect
          x="22"
          y="44"
          width="56"
          height="72"
          rx="18"
          className="fill-skn-pink/10 stroke-skn-ink/70"
          strokeWidth="2.5"
        />

        {/* גליץ' זכוכית */}
        <line
          x1="31"
          y1="58"
          x2="31"
          y2="98"
          stroke="white"
          strokeOpacity="0.4"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* צוואר */}
        <rect
          x="42"
          y="30"
          width="16"
          height="18"
          className="fill-skn-pink/10 stroke-skn-ink/70"
          strokeWidth="2.5"
        />

        {/* מכסה טפטפת */}
        <rect
          x="36"
          y="12"
          width="28"
          height="24"
          rx="6"
          className="fill-skn-pink-deep stroke-skn-ink/70"
          strokeWidth="2.5"
        />

        {/* צינורית זכוכית */}
        <rect x="48" y="18" width="4" height="70" className="fill-skn-ink/20" />

        {/* טיפה נופלת */}
        <circle
          cx="50"
          cy="88"
          r="2.6"
          className="skn-animate-drip fill-skn-pink-deep"
        />
      </g>
    </svg>
  );
}
