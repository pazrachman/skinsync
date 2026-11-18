"use client";

import { useId } from "react";
import { addMonths, differenceInCalendarDays, parseISO } from "date-fns";
import { getExpiryInfo } from "@/lib/expiry";
import { categorizeDevice, categorizeProduct } from "@/lib/productCategories";
import type { Product } from "@/lib/types";

export type BottleProduct = Pick<
  Product,
  | "name"
  | "category"
  | "is_device"
  | "active_ingredients"
  | "open_date"
  | "shelf_life_months"
  | "expiry_date_override"
>;

export type BottleKind = "dropper" | "pump" | "toner" | "tube" | "jar" | "jar-small" | "device";

// כל מוצר מצויר לפי מה שהוא בפועל: טפטפת לסרומים, משאבה לג'לים ותחליבים,
// בקבוק טונר עם פקק הברגה, שפופרת ל-SPF, צנצנת עם מכסה עץ למסכות וקרמי
// עיניים. השיוך לפי המדף (categorizeProduct) ומילות מפתח בשם.
export function bottleKind(p: BottleProduct): BottleKind {
  if (p.is_device) return "device";
  const text = `${p.name} ${p.category ?? ""}`;
  if (/עיני|eye/i.test(text)) return "jar-small";
  switch (categorizeProduct(p)) {
    case "serum":
      return "dropper";
    case "cleansing":
      return "pump";
    case "toner":
      return "toner";
    case "spf":
      return "tube";
    case "mask":
      return "jar";
    case "moisturizer":
      return /לוסיון|lotion|תחליב|חלב|קרם לחות|moistur/i.test(text) ? "pump" : "jar";
    default:
      return "toner";
  }
}

/** כמה "נשאר" בבקבוק — חלק מחיי המדף שעוד נותרו (1 = מלא, טרם נפתח). */
export function remainingFraction(p: BottleProduct, today: Date = new Date()): number {
  const info = getExpiryInfo(p, today);
  if (info.status === "unopened" || !info.expiryDate) return 1;
  if (info.status === "expired") return 0.05;
  const start = p.open_date
    ? parseISO(p.open_date)
    : addMonths(info.expiryDate, -p.shelf_life_months);
  const total = Math.max(1, differenceInCalendarDays(info.expiryDate, start));
  return Math.min(1, Math.max(0.08, (info.daysLeft ?? 0) / total));
}

const ACIDS = ["aha", "bha", "glycolic_acid", "lactic_acid", "mandelic_acid", "pha"];

function liquidTint(p: BottleProduct, kind: BottleKind): string {
  const ing = new Set<string>(p.active_ingredients ?? []);
  if (ing.has("vitamin_c")) return "#f0a63c";
  if (ing.has("retinol") || ing.has("retinaldehyde")) return "#ebcf74";
  if (ing.has("hyaluronic_acid")) return "#d7e6ee";
  if (ing.has("niacinamide")) return "#efe2c4";
  if (ACIDS.some((a) => ing.has(a))) return "#f2ddb8";
  if (/חימר|clay/i.test(p.name)) return "#b9a797";
  if (/פחם|charcoal/i.test(p.name)) return "#5d5650";
  if (kind === "pump") return "#efe5d3";
  if (kind === "toner") return "#f1dacb";
  if (kind === "jar" || kind === "jar-small") return "#f4ede2";
  return "#eadfcd";
}

function isAmberGlass(p: BottleProduct) {
  const ing = new Set<string>(p.active_ingredients ?? []);
  return ["vitamin_c", "retinol", "retinaldehyde", "ferulic_acid"].some((i) => ing.has(i));
}

const SHADOW_RX: Record<BottleKind, number> = {
  dropper: 24,
  pump: 27,
  toner: 21,
  tube: 18,
  jar: 31,
  "jar-small": 25,
  device: 24,
};

export default function ProductBottle({
  product,
  className,
}: {
  product: BottleProduct;
  className?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const kind = bottleKind(product);
  const fill = remainingFraction(product);
  const sealed = !product.is_device && getExpiryInfo(product).status === "unopened";
  const tint = liquidTint(product, kind);
  const u = (name: string) => `url(#${id}-${name})`;

  return (
    <svg
      viewBox="0 0 80 150"
      className={`skn-bottle-svg ${className ?? ""}`}
      aria-hidden
      focusable="false"
      overflow="visible"
    >
      <defs>
        <radialGradient id={`${id}-shadow`}>
          <stop offset="0" stopColor="#2d1e12" stopOpacity="0.42" />
          <stop offset="0.6" stopColor="#2d1e12" stopOpacity="0.16" />
          <stop offset="1" stopColor="#2d1e12" stopOpacity="0" />
        </radialGradient>
        {/* Cylinder shading: dark rims, a soft bright core. */}
        <linearGradient id={`${id}-cyl`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.3" />
          <stop offset="0.16" stopColor="#000" stopOpacity="0.05" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0.02" />
          <stop offset="0.86" stopColor="#000" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000" stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id={`${id}-spec`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.25" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="0.75" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-black`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#0d0b0a" />
          <stop offset="0.32" stopColor="#3d3834" />
          <stop offset="0.55" stopColor="#1c1917" />
          <stop offset="1" stopColor="#0a0908" />
        </linearGradient>
        <linearGradient id={`${id}-taupe`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#2a2420" />
          <stop offset="0.34" stopColor="#5e544d" />
          <stop offset="0.6" stopColor="#3b342f" />
          <stop offset="1" stopColor="#221d1a" />
        </linearGradient>
        <linearGradient id={`${id}-cream`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#d6ccbd" />
          <stop offset="0.38" stopColor="#faf6ef" />
          <stop offset="0.7" stopColor="#ece4d8" />
          <stop offset="1" stopColor="#cbc0b0" />
        </linearGradient>
        <linearGradient id={`${id}-wood`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#87623f" />
          <stop offset="0.4" stopColor="#c39a69" />
          <stop offset="0.72" stopColor="#a47b51" />
          <stop offset="1" stopColor="#795636" />
        </linearGradient>
        <linearGradient id={`${id}-jade`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#b9cdb6" />
          <stop offset="0.5" stopColor="#8fac8e" />
          <stop offset="1" stopColor="#6f8f71" />
        </linearGradient>
      </defs>

      <ellipse
        className="skn-bottle-shadow"
        cx="40"
        cy="145.5"
        rx={SHADOW_RX[kind]}
        ry="3.4"
        fill={u("shadow")}
      />

      <g className="skn-bottle-body">
        {kind === "dropper" && (
          <Dropper id={id} u={u} fill={fill} tint={tint} amber={isAmberGlass(product)} sealed={sealed} />
        )}
        {kind === "pump" && <Pump id={id} u={u} fill={fill} tint={tint} sealed={sealed} />}
        {kind === "toner" && <Toner id={id} u={u} fill={fill} tint={tint} sealed={sealed} />}
        {kind === "tube" && <Tube id={id} u={u} fill={fill} sealed={sealed} />}
        {(kind === "jar" || kind === "jar-small") && (
          <Jar id={id} u={u} fill={fill} tint={tint} sealed={sealed} small={kind === "jar-small"} />
        )}
        {kind === "device" && <Device u={u} name={product.name} />}
      </g>
    </svg>
  );
}

type ShapeProps = {
  id: string;
  u: (name: string) => string;
  fill: number;
  sealed: boolean;
};

const OUTLINE = "#6b5a4a";

function Spec({ u, x, y1, y2, rimX }: { u: ShapeProps["u"]; x: number; y1: number; y2: number; rimX: number }) {
  return (
    <>
      <rect x={x} y={y1} width="3" height={y2 - y1} rx="1.5" fill={u("spec")} />
      <rect x={rimX} y={y1 + 8} width="1.3" height={(y2 - y1) * 0.7} rx="0.65" fill="#fff" opacity="0.32" />
    </>
  );
}

function SealBand({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="1.4" fill="#f7f0e3" opacity="0.78" />
      <rect x={x} y={y} width={w} height={h} rx="1.4" fill="none" stroke="#8a6a3f" strokeOpacity="0.35" strokeWidth="0.5" />
      <path
        d={`M${x + 1} ${y + h / 2} H${x + w - 1}`}
        stroke="#8a6a3f"
        strokeWidth="0.7"
        strokeDasharray="1.4 1.2"
        opacity="0.8"
      />
    </g>
  );
}

function Dropper({ id, u, fill, tint, amber, sealed }: ShapeProps & { tint: string; amber: boolean }) {
  const body =
    "M20 77 C20 66.5 26 62.5 33 61.5 L33 55 L47 55 L47 61.5 C54 62.5 60 66.5 60 77 L60 136.5 C60 141 57 144 52.5 144 L27.5 144 C23 144 20 141 20 136.5 Z";
  const top = 70;
  const bottom = 144;
  const yL = bottom - fill * (bottom - top);

  return (
    <>
      <clipPath id={`${id}-clip`}>
        <path d={body} />
      </clipPath>
      <path d={body} fill={amber ? "#f3dcc0" : "#ffffff"} fillOpacity={amber ? 0.5 : 0.34} />
      <g clipPath={`url(#${id}-clip)`}>
        <rect x="18" y={yL} width="44" height={bottom - yL + 2} fill={tint} opacity={amber ? 0.95 : 0.85} />
        <rect x="18" y={yL} width="44" height="1.6" fill="#fff" opacity="0.45" />
        <rect x="38.4" y="55" width="3.2" height="66" rx="1.6" fill="#fff" opacity="0.3" />
        <path d="M38.4 119 L40 124 L41.6 119 Z" fill="#fff" opacity="0.3" />
        {/* Amber glass: light where empty, deep where the liquid sits, so
            the level still reads through the tint. */}
        {amber && (
          <>
            <rect x="18" y="55" width="44" height={yL - 55} fill="#b8692a" opacity="0.3" />
            <rect x="18" y={yL} width="44" height={bottom - yL + 2} fill="#8a4513" opacity="0.55" />
          </>
        )}
        <rect x="18" y="55" width="44" height="92" fill={u("cyl")} />
        <Spec u={u} x={23.6} y1={74} y2={133} rimX={54.6} />
        <path
          d="M25 70.5 C26 66.5 29.5 64.3 33 63.8"
          stroke="#fff"
          strokeOpacity="0.6"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M22.5 139.5 C24 142 26 142.6 28 142.6 L52 142.6 C54 142.6 56 142 57.5 139.5"
          stroke="#fff"
          strokeOpacity="0.4"
          fill="none"
        />
      </g>
      <path d={body} fill="none" stroke={amber ? "#5a2c0b" : OUTLINE} strokeOpacity={amber ? 0.55 : 0.35} strokeWidth="0.8" />

      {/* Ribbed black collar */}
      <rect x="29" y="38" width="22" height="19" rx="2.2" fill={u("black")} />
      {Array.from({ length: 10 }, (_, i) => (
        <path key={i} d={`M${30.6 + i * 2} 39.6 V55.4`} stroke="#fff" strokeOpacity="0.1" strokeWidth="0.6" />
      ))}
      <rect x="29" y="38" width="22" height="1.3" rx="0.65" fill="#fff" opacity="0.18" />
      {/* Rubber bulb */}
      <path
        d="M32.5 39 C32.5 31 33.6 22 35.2 16.5 C36.4 12 38 10 40 10 C42 10 43.6 12 44.8 16.5 C46.4 22 47.5 31 47.5 39 Z"
        fill="#26211e"
      />
      <path
        d="M35.8 33 C35.8 26 36.6 20 37.8 16"
        stroke="#fff"
        strokeOpacity="0.22"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="31.5" y="36.6" width="17" height="2.8" rx="1.2" fill="#171412" />
      {sealed && <SealBand x={28.4} y={50} w={23.2} h={9} />}
    </>
  );
}

function Pump({ id, u, fill, tint, sealed }: ShapeProps & { tint: string }) {
  const body =
    "M17 74 C17 65 22 61.5 29.5 61 L50.5 61 C58 61.5 63 65 63 74 L63 136 C63 140.5 59.5 144 55 144 L25 144 C20.5 144 17 140.5 17 136 Z";
  const top = 68;
  const bottom = 144;
  const yL = bottom - fill * (bottom - top);

  return (
    <>
      <clipPath id={`${id}-clip`}>
        <path d={body} />
      </clipPath>
      <path d={body} fill="#fbf8f3" fillOpacity="0.6" />
      <g clipPath={`url(#${id}-clip)`}>
        <rect x="15" y={yL} width="50" height={bottom - yL + 2} fill={tint} opacity="0.92" />
        <rect x="15" y={yL} width="50" height="1.4" fill="#fff" opacity="0.5" />
        <path d="M40 61 V139" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.3" />
        {/* frosted PET */}
        <rect x="15" y="58" width="50" height="90" fill="#fff" opacity="0.16" />
        <rect x="15" y="58" width="50" height="90" fill={u("cyl")} />
        <Spec u={u} x={21.6} y1={72} y2={134} rimX={57.6} />
      </g>
      <path d={body} fill="none" stroke={OUTLINE} strokeOpacity="0.3" strokeWidth="0.8" />

      {/* Collar, stem, actuator with nozzle */}
      <rect x="30" y="50" width="20" height="12" rx="2" fill={u("cream")} stroke="#9a8d7d" strokeOpacity="0.5" strokeWidth="0.5" />
      {[52.6, 55, 57.4, 59.8].map((y) => (
        <path key={y} d={`M30.6 ${y} H49.4`} stroke="#000" strokeOpacity="0.07" strokeWidth="0.6" />
      ))}
      <rect x="37.6" y="38" width="4.8" height="13" fill={u("cream")} stroke="#9a8d7d" strokeOpacity="0.45" strokeWidth="0.4" />
      <path
        d="M29 29.5 Q29 27.5 31 27.5 L49 27.5 Q51 27.5 51 29.5 L51 38.5 L29 38.5 Z"
        fill={u("cream")}
        stroke="#9a8d7d"
        strokeOpacity="0.5"
        strokeWidth="0.5"
      />
      <path
        d="M29.5 29.6 L14.5 29.6 Q12 29.6 12 31.6 Q12 33.6 14.5 33.6 L29.5 33.6 Z"
        fill={u("cream")}
        stroke="#9a8d7d"
        strokeOpacity="0.5"
        strokeWidth="0.5"
      />
      <circle cx="13.6" cy="31.6" r="0.9" fill="#8b7f72" />
      <rect x="31" y="28" width="18" height="1.2" rx="0.6" fill="#fff" opacity="0.6" />
      {sealed && (
        <g>
          <rect x="34" y="39" width="12" height="11" rx="1.4" fill="#b8914f" />
          <rect x="34" y="39" width="12" height="2" rx="1" fill="#fff" opacity="0.3" />
        </g>
      )}
    </>
  );
}

function Toner({ id, u, fill, tint, sealed }: ShapeProps & { tint: string }) {
  const body =
    "M24 61 C24 53 29.5 49.5 35.5 48.5 L35.5 42 L44.5 42 L44.5 48.5 C50.5 49.5 56 53 56 61 L56 138.5 C56 141.5 53.5 144 50.5 144 L29.5 144 C26.5 144 24 141.5 24 138.5 Z";
  const top = 58;
  const bottom = 144;
  const yL = bottom - fill * (bottom - top);

  return (
    <>
      <clipPath id={`${id}-clip`}>
        <path d={body} />
      </clipPath>
      <path d={body} fill="#ffffff" fillOpacity="0.32" />
      <g clipPath={`url(#${id}-clip)`}>
        <rect x="22" y={yL} width="36" height={bottom - yL + 2} fill={tint} opacity="0.82" />
        <rect x="22" y={yL} width="36" height="1.4" fill="#fff" opacity="0.5" />
        <rect x="22" y="40" width="36" height="106" fill={u("cyl")} />
        <Spec u={u} x={27.4} y1={62} y2={136} rimX={51.4} />
        <path
          d="M28 57 C29 53.5 32 51.6 35.5 51"
          stroke="#fff"
          strokeOpacity="0.55"
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <path d={body} fill="none" stroke={OUTLINE} strokeOpacity="0.35" strokeWidth="0.8" />

      {/* Screw cap */}
      <rect x="32.5" y="20" width="15" height="23.5" rx="2.6" fill={u("taupe")} />
      <rect x="32.5" y="20" width="15" height="1.4" rx="0.7" fill="#fff" opacity="0.22" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M${33.8 + i * 1.75} 37.2 V42.6`} stroke="#fff" strokeOpacity="0.12" strokeWidth="0.55" />
      ))}
      <rect x="35" y="22" width="1.6" height="14" rx="0.8" fill="#fff" opacity="0.16" />
      {sealed && <SealBand x={31.4} y={39} w={17.2} h={7} />}
    </>
  );
}

// שפופרת שעומדת על הפקק: ככל שהיא מתרוקנת החלק העליון נשטח ומתקמט.
function Tube({ id, u, fill, sealed }: Omit<ShapeProps, "tint">) {
  const bulge = 1 + fill * 4;
  const yE = 27 + (1 - fill) * 62;
  const body = `M13 27 L67 27 Q${67 + bulge} 71 55.5 116 L24.5 116 Q${13 - bulge} 71 13 27 Z`;

  return (
    <>
      <clipPath id={`${id}-clip`}>
        <path d={body} />
      </clipPath>
      {/* Cap (flip-top), shoulder */}
      <path d="M27 122 L53 122 L54 141 Q54 144 51 144 L29 144 Q26 144 26 141 Z" fill={u("cream")} stroke="#9a8d7d" strokeOpacity="0.5" strokeWidth="0.5" />
      <path d="M26.6 128.4 H53.4" stroke="#000" strokeOpacity="0.12" strokeWidth="0.6" />
      {sealed && <rect x="26.6" y="124.6" width="26.8" height="3" fill="#b8914f" opacity="0.9" />}
      <path d="M24.5 115.5 L55.5 115.5 L53 122.5 L27 122.5 Z" fill="#f2ece2" />
      <path d="M24.5 115.5 L55.5 115.5 L53 122.5 L27 122.5 Z" fill={u("cyl")} />

      <path d={body} fill="#f5f0e8" />
      <g clipPath={`url(#${id}-clip)`}>
        {/* Rounded (still full) part */}
        <rect x="8" y={yE} width="64" height={120 - yE} fill={u("cyl")} />
        {/* Label band */}
        <rect x="8" y="88" width="64" height="12" fill="#dcc29a" opacity="0.75" />
        <rect x="8" y="88" width="64" height="12" fill={u("cyl")} />
        <Spec u={u} x={19.5} y1={Math.max(yE + 4, 34)} y2={112} rimX={58} />
        {/* Flattened, emptied part */}
        {fill < 0.97 && (
          <>
            <rect x="8" y="27" width="64" height={yE - 27} fill="#fff" opacity="0.28" />
            <rect x="8" y="27" width="64" height={yE - 27} fill="#000" opacity="0.025" />
            <path
              d={`M12 ${yE} q 7 -2.6 14 0 t 14 0 t 14 0 t 14 0`}
              stroke="#000"
              strokeOpacity="0.16"
              strokeWidth="0.9"
              fill="none"
            />
            <path
              d={`M12 ${yE + 1.3} q 7 -2.6 14 0 t 14 0 t 14 0 t 14 0`}
              stroke="#fff"
              strokeOpacity="0.7"
              strokeWidth="0.8"
              fill="none"
            />
            {fill < 0.75 && (
              <>
                <path d={`M20 ${yE - 5} L33 ${yE - 15}`} stroke="#000" strokeOpacity="0.09" strokeWidth="0.8" />
                <path d={`M60 ${yE - 4} L47 ${yE - 13}`} stroke="#000" strokeOpacity="0.09" strokeWidth="0.8" />
                <path d={`M34 ${yE - 3} L45 ${yE - 9}`} stroke="#fff" strokeOpacity="0.6" strokeWidth="0.8" />
              </>
            )}
          </>
        )}
      </g>
      <path d={body} fill="none" stroke={OUTLINE} strokeOpacity="0.3" strokeWidth="0.8" />

      {/* Crimped seal at the top */}
      <rect x="12" y="19" width="56" height="9" rx="1.2" fill="#ece5da" stroke="#9a8d7d" strokeOpacity="0.45" strokeWidth="0.5" />
      {Array.from({ length: 24 }, (_, i) => (
        <path key={i} d={`M${14 + i * 2.2} 20.4 V26.6`} stroke="#000" strokeOpacity="0.09" strokeWidth="0.5" />
      ))}
    </>
  );
}

function Jar({ id, u, fill, tint, sealed, small }: ShapeProps & { tint: string; small: boolean }) {
  const body = "M14 103 Q14 100 17 100 L63 100 Q66 100 66 103 L66 138 Q66 144 60 144 L20 144 Q14 144 14 138 Z";
  const top = 104;
  const bottom = 142;
  const yL = bottom - fill * (bottom - top);

  return (
    <g transform={small ? "translate(40 146) scale(0.8) translate(-40 -146)" : undefined}>
      <clipPath id={`${id}-clip`}>
        <path d={body} />
      </clipPath>
      <path d={body} fill="#ffffff" fillOpacity="0.45" />
      <g clipPath={`url(#${id}-clip)`}>
        <rect x="12" y={yL} width="56" height={bottom - yL + 4} fill={tint} />
        <rect x="12" y={yL} width="56" height="1.3" fill="#fff" opacity="0.5" />
        <rect x="12" y="98" width="56" height="48" fill="#fff" opacity="0.2" />
        <rect x="12" y="98" width="56" height="48" fill={u("cyl")} />
        <rect x="12" y="100" width="56" height="3" fill="#000" opacity="0.12" />
        <Spec u={u} x={18.4} y1={105} y2={138} rimX={61} />
        <path d="M16 140.5 Q18 142.6 21 142.6 L59 142.6 Q62 142.6 64 140.5" stroke="#fff" strokeOpacity="0.45" fill="none" />
      </g>
      <path d={body} fill="none" stroke={OUTLINE} strokeOpacity="0.35" strokeWidth="0.8" />

      {/* Wooden lid */}
      <rect x="12" y="80" width="56" height="22" rx="3.5" fill={u("wood")} />
      <path d="M14 85.5 C30 84 45 87.2 66 85.2" stroke="#4a2f17" strokeOpacity="0.22" strokeWidth="0.6" fill="none" />
      <path d="M14 91 C28 92.6 48 89.4 66 91.4" stroke="#4a2f17" strokeOpacity="0.2" strokeWidth="0.6" fill="none" />
      <path d="M14 96.5 C32 95.2 46 97.8 66 96.2" stroke="#4a2f17" strokeOpacity="0.18" strokeWidth="0.6" fill="none" />
      <rect x="12" y="80" width="56" height="1.6" rx="0.8" fill="#fff" opacity="0.28" />
      <rect x="12" y="100" width="56" height="2" fill="#000" opacity="0.12" />
      {sealed && (
        <g>
          <rect x="36" y="82" width="8" height="26" rx="0.8" fill="#f7f0e3" opacity="0.9" />
          <rect x="36" y="82" width="8" height="26" rx="0.8" fill="none" stroke="#8a6a3f" strokeOpacity="0.4" strokeWidth="0.5" />
          <circle cx="40" cy="95" r="1.6" fill="#b8914f" />
        </g>
      )}
    </g>
  );
}

function Device({ u, name }: { u: ShapeProps["u"]; name: string }) {
  const kind = categorizeDevice(name);

  if (kind === "led") {
    return (
      <>
        <path
          d="M40 44 C58 44 66 62 66 86 C66 114 56 140 40 140 C24 140 14 114 14 86 C14 62 22 44 40 44 Z"
          fill={u("cream")}
          stroke="#9a8d7d"
          strokeOpacity="0.5"
          strokeWidth="0.6"
        />
        <ellipse cx="30.5" cy="82" rx="6" ry="3.6" fill="#2c2622" opacity="0.6" />
        <ellipse cx="49.5" cy="82" rx="6" ry="3.6" fill="#2c2622" opacity="0.6" />
        <ellipse cx="40" cy="118" rx="6" ry="3" fill="#2c2622" opacity="0.5" />
        <path d="M22 62 C26 54 32 50 38 49" stroke="#fff" strokeOpacity="0.8" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </>
    );
  }

  if (kind === "roller") {
    return (
      <>
        <rect x="37.5" y="70" width="5" height="72" rx="2.5" fill={u("cream")} stroke="#9a8d7d" strokeOpacity="0.5" strokeWidth="0.5" />
        <rect x="20" y="52" width="40" height="18" rx="9" fill={u("jade")} />
        <path d="M24 56 H52" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.4" strokeLinecap="round" />
        <rect x="18" y="58" width="4" height="6" rx="1" fill="#b8914f" />
        <rect x="58" y="58" width="4" height="6" rx="1" fill="#b8914f" />
      </>
    );
  }

  if (kind === "brush") {
    return (
      <>
        <rect x="35" y="86" width="10" height="56" rx="5" fill={u("cream")} stroke="#9a8d7d" strokeOpacity="0.5" strokeWidth="0.5" />
        <circle cx="40" cy="68" r="20" fill="#e8ddd0" stroke="#9a8d7d" strokeOpacity="0.5" strokeWidth="0.5" />
        <circle cx="40" cy="68" r="14" fill="#d9cbbb" />
        <circle cx="34" cy="62" r="4" fill="#fff" opacity="0.5" />
      </>
    );
  }

  if (kind === "guasha") {
    return (
      <>
        <path d="M22 140 C14 120 16 98 28 90 C34 86 40 92 44 98 C50 90 60 92 62 104 C64 118 56 134 44 142 Z" fill={u("jade")} />
        <path d="M24 120 C22 108 26 98 32 95" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </>
    );
  }

  return (
    <>
      <rect x="22" y="62" width="36" height="80" rx="14" fill={u("cream")} stroke="#9a8d7d" strokeOpacity="0.5" strokeWidth="0.6" />
      <circle cx="40" cy="80" r="4" fill="#b8914f" />
      <rect x="27" y="70" width="3" height="60" rx="1.5" fill="#fff" opacity="0.6" />
    </>
  );
}
