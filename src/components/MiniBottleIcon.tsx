// גרסה זעירה של הבקבוקון — לשימוש כאייקון ליד שם מוצר. הצבע של הזכוכית
// נושא משמעות אמיתית (סטטוס תפוגה בארון, בוקר/ערב בשגרה), לא רק קישוט.
export default function MiniBottleIcon({
  fillClassName = "fill-skn-sand",
  className,
}: {
  fillClassName?: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 32" className={className} aria-hidden role="presentation">
      <rect x="9" y="3" width="6" height="5" rx="1.5" className="fill-skn-ink/50" />
      <rect x="10.5" y="8" width="3" height="4" className="fill-skn-ink/20" />
      <rect
        x="5"
        y="12"
        width="14"
        height="17"
        rx="4"
        className={`${fillClassName} stroke-skn-ink/50`}
        strokeWidth="1.3"
      />
    </svg>
  );
}
