import { cn } from "@/lib/utils";
import { momentCategoryConfig, ALL_MOMENT_CATEGORIES } from "@/lib/mockData";
import type { MomentCategory } from "@/types/db";

interface MomentCategoryChipProps {
  category: MomentCategory;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}

export function MomentCategoryChip({
  category,
  selected = false,
  onClick,
  size = "md",
}: MomentCategoryChipProps) {
  const config = momentCategoryConfig[category];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border text-xs font-semibold transition-all",
        size === "sm" ? "px-2 py-0.5" : "px-3 py-1.5",
        selected
          ? cn(config.color, config.bg, config.border)
          : "text-[#4A5A4A] bg-transparent border-[#1E251E] hover:border-[#2E3A2E] hover:text-[#8B9A8B]"
      )}
    >
      {config.label}
    </button>
  );
}

interface MomentCategoryBadgeProps {
  category: MomentCategory | null;
}

export function MomentCategoryBadge({ category }: MomentCategoryBadgeProps) {
  if (!category) return null;
  const config = momentCategoryConfig[category];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold",
        config.color,
        config.bg,
        config.border
      )}
    >
      {config.label}
    </span>
  );
}

interface CategoryFilterBarProps {
  selected: MomentCategory[];
  onToggle: (cat: MomentCategory) => void;
  onClear?: () => void;
}

export function CategoryFilterBar({ selected, onToggle, onClear }: CategoryFilterBarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {ALL_MOMENT_CATEGORIES.map((cat) => (
        <MomentCategoryChip
          key={cat}
          category={cat}
          selected={selected.includes(cat)}
          onClick={() => onToggle(cat)}
        />
      ))}
      {selected.length > 0 && onClear && (
        <button
          onClick={onClear}
          className="text-xs text-[#4A5A4A] hover:text-[#C2FF45] transition-colors ml-1"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
