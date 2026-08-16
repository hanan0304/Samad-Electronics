const STYLES: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  RESPONDED: "bg-amber-100 text-amber-700",
  CLOSED: "bg-gray-200 text-gray-700",
  READ: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-green-100 text-green-700",
};

const LABELS: Record<string, string> = {
  NEW: "New",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  RESPONDED: "Responded",
  CLOSED: "Closed",
  READ: "Read",
  RESOLVED: "Resolved",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        STYLES[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {LABELS[status] || status}
    </span>
  );
}
