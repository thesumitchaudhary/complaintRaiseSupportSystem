export const raisedDateFilterOptions = [
  { value: "all", label: "All dates" },
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
  { value: "thisMonth", label: "This month" },
];

export function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getStatusKey(status) {
  return String(status || "pending")
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/_+/g, "_");
}

export function formatStatusLabel(status) {
  return getStatusKey(status)
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getComplaintDate(complaint) {
  const rawDate = complaint?.raisedDate || complaint?.createdAt;
  const date = rawDate ? new Date(rawDate) : null;

  return date && !Number.isNaN(date.getTime()) ? date : null;
}

export function getComplaintSearchText(complaint) {
  return [
    complaint?.customerId?.name,
    complaint?.customerId?.email,
    complaint?.name,
    complaint?.email,
    complaint?.subject,
    complaint?.message,
    complaint?.status,
    complaint?.serviceType,
    complaint?.raisedDate,
    complaint?.createdAt,
    complaint?._id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function getRaisedDateRange(filterValue, customDate) {
  const today = new Date();
  const endDate = endOfDay(today);
  let startDate;

  if (filterValue === "custom" && customDate) {
    return {
      startDate: startOfDay(customDate),
      endDate: endOfDay(customDate),
    };
  }

  if (filterValue === "today") {
    startDate = startOfDay(today);
  } else if (filterValue === "last7") {
    startDate = startOfDay(today);
    startDate.setDate(startDate.getDate() - 6);
  } else if (filterValue === "last30") {
    startDate = startOfDay(today);
    startDate.setDate(startDate.getDate() - 29);
  } else if (filterValue === "thisMonth") {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  }

  return startDate ? { startDate, endDate } : null;
}

export function getRaisedDateParams(filterValue, customDate) {
  const range = getRaisedDateRange(filterValue, customDate);

  if (!range) return {};

  return {
    startDate: range.startDate.toISOString(),
    endDate: range.endDate.toISOString(),
  };
}

export function getRaisedDateFilterLabel(filterValue, customDate) {
  if (filterValue === "custom" && customDate) {
    return formatDate(customDate);
  }

  return (
    raisedDateFilterOptions.find((option) => option.value === filterValue)
      ?.label || "All dates"
  );
}

export function getStatusBadgeClass(status, isDarkTheme) {
  const statusKey = getStatusKey(status);
  const statusClasses = isDarkTheme ? darkStatusClasses : lightStatusClasses;

  return (
    statusClasses[statusKey] ||
    (isDarkTheme
      ? "bg-slate-800 text-slate-200"
      : "bg-slate-100 text-slate-700")
  );
}

function startOfDay(date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function endOfDay(date) {
  const nextDate = new Date(date);
  nextDate.setHours(23, 59, 59, 999);
  return nextDate;
}

const darkStatusClasses = {
  pending: "bg-amber-950 text-amber-200",
  accepted: "bg-cyan-950 text-cyan-200",
  assigned: "bg-violet-950 text-violet-200",
  in_progress: "bg-blue-950 text-blue-200",
  completed: "bg-emerald-950 text-emerald-200",
  resolved: "bg-emerald-950 text-emerald-200",
  rejected: "bg-red-950 text-red-200",
  overdue: "bg-rose-950 text-rose-200",
  on_hold: "bg-orange-950 text-orange-200",
};

const lightStatusClasses = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-cyan-100 text-cyan-700",
  assigned: "bg-violet-100 text-violet-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  resolved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  overdue: "bg-rose-100 text-rose-700",
  on_hold: "bg-orange-100 text-orange-700",
};
