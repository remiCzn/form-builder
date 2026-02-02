import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: "DRAFT" | "PUBLISHED";
};

const statusStyles: Record<StatusBadgeProps["status"], string> = {
  DRAFT: "bg-amber-100 text-amber-800",
  PUBLISHED: "bg-emerald-100 text-emerald-800",
};

const statusLabels: Record<StatusBadgeProps["status"], string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publie",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
