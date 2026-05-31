/**
 * Deterministic crop visual — NO network, never 404s.
 *
 * The seeded crop photos were dead Unsplash links (every one 404'd), which
 * made every card fall back to the same generic photo ("template dirt").
 * Instead we render a clean category-coloured banner with an emoji glyph and
 * the crop name. Distinct, on-brand, and always loads instantly.
 */

type Category =
  | "cereal" | "pulse" | "vegetable" | "fruit"
  | "oilseed" | "spice" | "cash_crop" | "other";

const STYLE: Record<Category, { from: string; to: string; ring: string; emoji: string }> = {
  cereal:    { from: "#fef3c7", to: "#fcd34d", ring: "#b45309", emoji: "🌾" },
  pulse:     { from: "#fef9c3", to: "#fde047", ring: "#a16207", emoji: "🫘" },
  vegetable: { from: "#dcfce7", to: "#4ade80", ring: "#15803d", emoji: "🥬" },
  fruit:     { from: "#ffe4e6", to: "#fb7185", ring: "#be123c", emoji: "🍎" },
  oilseed:   { from: "#fef3c7", to: "#fbbf24", ring: "#92400e", emoji: "🌻" },
  spice:     { from: "#ffedd5", to: "#fb923c", ring: "#c2410c", emoji: "🌶️" },
  cash_crop: { from: "#ccfbf1", to: "#2dd4bf", ring: "#0f766e", emoji: "💠" },
  other:     { from: "#ecfccb", to: "#a3e635", ring: "#4d7c0f", emoji: "🌱" },
};

export function CropVisual({
  name,
  category = "other",
  className = "",
}: {
  name: string;
  category?: string;
  className?: string;
}) {
  const s = STYLE[(category as Category)] ?? STYLE.other;
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
      role="img"
      aria-label={name}
    >
      {/* faint tilled-row texture */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.12] mix-blend-multiply"
        style={{
          backgroundImage: `repeating-linear-gradient(115deg, ${s.ring} 0 1px, transparent 1px 14px)`,
        }}
      />
      <span aria-hidden className="text-4xl drop-shadow-sm select-none">
        {s.emoji}
      </span>
    </div>
  );
}
