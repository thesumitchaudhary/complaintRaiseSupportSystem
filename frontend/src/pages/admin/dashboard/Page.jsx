import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Moon, Search, Sun } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "../../../components/admin-app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../components/ui/breadcrumb";
import { Calendar } from "../../../components/ui/calendar";
import { Separator } from "../../../components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import { showComplain, showEmployee, showUser } from "../../../services/admin";

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatStatusLabel = (status) => {
  return String(status || "pending")
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const renderHighlightedText = (value, searchTerm, highlightClassName) => {
  const text = String(value || "-");
  const needle = String(searchTerm || "").trim();

  if (!needle) return text;

  const lowerText = text.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  const parts = [];
  let cursor = 0;
  let matchIndex = lowerText.indexOf(lowerNeedle);

  while (matchIndex !== -1) {
    if (matchIndex > cursor) {
      parts.push(text.slice(cursor, matchIndex));
    }

    const matchEnd = matchIndex + needle.length;
    parts.push(
      <mark
        key={`${matchIndex}-${matchEnd}`}
        className={`rounded px-0.5 ${highlightClassName}`}
      >
        {text.slice(matchIndex, matchEnd)}
      </mark>,
    );

    cursor = matchEnd;
    matchIndex = lowerText.indexOf(lowerNeedle, cursor);
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts;
};

const raisedDateFilterOptions = [
  { value: "all", label: "All dates" },
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
  { value: "thisMonth", label: "This month" },
];

const startOfDay = (date) => {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const endOfDay = (date) => {
  const nextDate = new Date(date);
  nextDate.setHours(23, 59, 59, 999);
  return nextDate;
};

const getRaisedDateRange = (filterValue, customDate) => {
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
  }

  if (filterValue === "last7") {
    startDate = startOfDay(today);
    startDate.setDate(startDate.getDate() - 6);
  }

  if (filterValue === "last30") {
    startDate = startOfDay(today);
    startDate.setDate(startDate.getDate() - 29);
  }

  if (filterValue === "thisMonth") {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  }

  if (!startDate) return null;

  return { startDate, endDate };
};

const getRaisedDateFilterLabel = (filterValue, customDate) => {
  if (filterValue === "custom" && customDate) {
    return formatDate(customDate);
  }

  return (
    raisedDateFilterOptions.find((option) => option.value === filterValue)
      ?.label || "All dates"
  );
};

const getComplaintDate = (complaint) => {
  const rawDate = complaint?.raisedDate || complaint?.createdAt;
  const date = rawDate ? new Date(rawDate) : null;

  return date && !Number.isNaN(date.getTime()) ? date : null;
};

const getSearchText = (complaint) => {
  return [
    complaint?.customerId?.name,
    complaint?.customerId?.email,
    complaint?.subject,
    complaint?.message,
    complaint?.status,
    complaint?.serviceType,
    complaint?._id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const getStatusBadgeClass = (status, isDarkTheme) => {
  const normalizedStatus = String(status || "pending")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const statusClasses = isDarkTheme
    ? {
        pending: "bg-amber-950 text-amber-200",
        accepted: "bg-cyan-950 text-cyan-200",
        assigned: "bg-violet-950 text-violet-200",
        in_progress: "bg-blue-950 text-blue-200",
        completed: "bg-emerald-950 text-emerald-200",
        resolved: "bg-emerald-950 text-emerald-200",
        rejected: "bg-red-950 text-red-200",
        overdue: "bg-rose-950 text-rose-200",
      }
    : {
        pending: "bg-amber-100 text-amber-700",
        accepted: "bg-cyan-100 text-cyan-700",
        assigned: "bg-violet-100 text-violet-700",
        in_progress: "bg-blue-100 text-blue-700",
        completed: "bg-emerald-100 text-emerald-700",
        resolved: "bg-emerald-100 text-emerald-700",
        rejected: "bg-red-100 text-red-700",
        overdue: "bg-rose-100 text-rose-700",
      };

  return (
    statusClasses[normalizedStatus] ||
    (isDarkTheme
      ? "bg-slate-800 text-slate-200"
      : "bg-slate-100 text-slate-700")
  );
};

export default function Page() {
  const [theme, setTheme] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [raisedDateFilter, setRaisedDateFilter] = useState("all");
  const [selectedRaisedDate, setSelectedRaisedDate] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const isDarkTheme = theme;

  const pageTheme = isDarkTheme
    ? {
        shell: "bg-slate-950 text-slate-100",
        header: "border-blue-900/60 bg-slate-900",
        panel: "border-blue-900/60 bg-slate-900 text-slate-100",
        card: "border-blue-900/70 bg-slate-900 text-slate-100",
        tableHead: "bg-slate-950 text-slate-200",
        tableRow: "border-blue-900/40 hover:bg-slate-800/70",
        field:
          "border-blue-900/70 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500",
        divider: "border-blue-900/60",
        muted: "text-slate-400",
        button: "border-blue-900/70 text-slate-100 hover:bg-slate-800",
        suggestionHover: "hover:bg-slate-800",
        highlight: "bg-yellow-300/30 text-yellow-100",
      }
    : {
        shell: "bg-[#f8fbff] text-[#001a3a]",
        header: "border-[#c7ddff] bg-white",
        panel: "border-[#b8d8ff] bg-white text-[#001a3a]",
        card: "border-[#b8d8ff] bg-[#eef6ff] text-[#12365c] shadow-[0_14px_24px_-20px_rgba(37,99,235,0.95)]",
        tableHead: "bg-[#f8fbff] text-[#001a3a]",
        tableRow: "border-[#c7ddff] hover:bg-[#f2f7ff]",
        field:
          "border-[#b8d8ff] bg-white text-[#001a3a] placeholder:text-[#6a7f9e] focus-visible:ring-blue-400",
        divider: "border-[#c7ddff]",
        muted: "text-[#4e678a]",
        button: "border-[#b8d8ff] text-[#12365c] hover:bg-[#eef6ff]",
        suggestionHover: "hover:bg-[#eef6ff]",
        highlight: "bg-yellow-200 text-[#001a3a]",
      };

  const raisedDateRange = useMemo(
    () => getRaisedDateRange(raisedDateFilter, selectedRaisedDate),
    [raisedDateFilter, selectedRaisedDate],
  );
  const raisedDateFilterLabel = useMemo(
    () => getRaisedDateFilterLabel(raisedDateFilter, selectedRaisedDate),
    [raisedDateFilter, selectedRaisedDate],
  );
  const hasActiveDateFilter =
    raisedDateFilter !== "all" || Boolean(selectedRaisedDate);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const backgroundColor = isDarkTheme ? "#020617" : "#f8fbff";
    const textColor = isDarkTheme ? "#f8fafc" : "#001a3a";

    root.classList.toggle("dark", isDarkTheme);
    root.style.backgroundColor = backgroundColor;
    body.style.backgroundColor = backgroundColor;
    body.style.color = textColor;
  }, [isDarkTheme]);

  const { data, isLoading } = useQuery({
    queryKey: ["showComplaints"],
    queryFn: showComplain,
  });

  const { data: customerData, isLoading: isCustomerLoading } = useQuery({
    queryKey: ["adminCustomers"],
    queryFn: showUser,
  });

  const { data: employeeData, isLoading: isEmployeeLoading } = useQuery({
    queryKey: ["adminEmployees"],
    queryFn: showEmployee,
  });

  const complaints = useMemo(
    () => (Array.isArray(data?.result) ? data.result : []),
    [data],
  );
  const customers = Array.isArray(customerData?.result)
    ? customerData.result
    : [];
  const employees = Array.isArray(employeeData?.result)
    ? employeeData.result
    : [];

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const complaintDate = getComplaintDate(complaint);
      const matchesDate =
        !raisedDateRange ||
        (complaintDate &&
          complaintDate >= raisedDateRange.startDate &&
          complaintDate <= raisedDateRange.endDate);

      if (!matchesDate) return false;
      if (!debouncedSearch) return true;

      return getSearchText(complaint).includes(debouncedSearch);
    });
  }, [complaints, debouncedSearch, raisedDateRange]);

  const suggestions = useMemo(() => {
    const needle = search.trim().toLowerCase();

    if (!needle) return [];

    return complaints
      .filter((complaint) =>
        String(complaint?.subject || "")
          .toLowerCase()
          .includes(needle),
      )
      .slice(0, 5);
  }, [complaints, search]);

  const pendingComplaints = complaints.filter(
    (complaint) => String(complaint?.status || "").toLowerCase() === "pending",
  ).length;
  const recentComplaints = filteredComplaints.slice(0, 5);

  const clearRaisedDateFilter = () => {
    setRaisedDateFilter("all");
    setSelectedRaisedDate(null);
    setDatePickerOpen(false);
  };

  const stats = [
    {
      label: "Total customers",
      value: isCustomerLoading ? "..." : customers.length,
      detail: "Registered users",
      accent: isDarkTheme ? "text-blue-300" : "text-blue-600",
    },
    {
      label: "Total employees",
      value: isEmployeeLoading ? "..." : employees.length,
      detail: "Active staff",
      accent: isDarkTheme ? "text-emerald-300" : "text-emerald-600",
    },
    {
      label: "Complaints",
      value: complaints.length,
      detail: "All recorded tickets",
      accent: isDarkTheme ? "text-sky-300" : "text-blue-600",
    },
    {
      label: "Pending",
      value: pendingComplaints,
      detail: "Waiting for action",
      accent: isDarkTheme ? "text-orange-300" : "text-orange-500",
    },
  ];

  return (
    <div className={`${pageTheme.shell} min-h-screen`}>
      <SidebarProvider style={{ backgroundColor: "transparent" }}>
        <AppSidebar />
        <SidebarInset style={{ backgroundColor: "transparent" }}>
          <header
            className={`sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b ${pageTheme.header}`}
          >
            <div className="flex w-full items-center justify-between gap-3 px-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink
                        className={`text-sm ${pageTheme.muted}`}
                        href="#"
                      >
                        Admin dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className={`text-sm ${pageTheme.muted}`}>
                        Dashboard
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <button
                type="button"
                aria-label="Toggle theme"
                className={`inline-flex h-10 w-10 items-center justify-center rounded-md border transition-colors ${pageTheme.button}`}
                onClick={() => setTheme((currentTheme) => !currentTheme)}
              >
                {isDarkTheme ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>
            </div>
          </header>

          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 lg:p-6">
            <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-normal">
                  Admin Dashboard
                </h1>
                <p className={`mt-1 max-w-2xl text-sm ${pageTheme.muted}`}>
                  Review employees, users, and complaint activity in one place.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-80">
                  <Search
                    className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${pageTheme.muted}`}
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search complaints"
                    className={`h-10 w-full rounded-md border py-2 pl-9 pr-3 text-sm outline-none transition-colors focus-visible:ring-2 ${pageTheme.field}`}
                  />

                  {suggestions.length > 0 ? (
                    <div
                      className={`absolute left-0 top-full z-50 mt-1 w-full rounded-md border shadow-lg ${pageTheme.panel}`}
                    >
                      {suggestions.map((item) => (
                        <button
                          key={item?._id}
                          type="button"
                          className={`block w-full px-3 py-2 text-left text-sm transition-colors ${pageTheme.suggestionHover}`}
                          onClick={() => setSearch(item?.subject || "")}
                        >
                          {renderHighlightedText(
                            item?.subject || "Untitled complaint",
                            search,
                            pageTheme.highlight,
                          )}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="relative w-full sm:w-64">
                  <CalendarDays
                    className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${pageTheme.muted}`}
                  />
                  <button
                    type="button"
                    aria-expanded={datePickerOpen}
                    aria-label="Filter complaints by raised date"
                    onClick={() => setDatePickerOpen((open) => !open)}
                    className={`h-10 w-full rounded-md border py-2 pl-9 pr-9 text-left text-sm outline-none transition-colors ${pageTheme.field}`}
                  >
                    {raisedDateFilterLabel}
                  </button>
                  <ChevronDown
                    className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${pageTheme.muted}`}
                  />

                  {datePickerOpen ? (
                    <div
                      className={`absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border p-3 shadow-xl ${pageTheme.panel}`}
                    >
                      <div className="flex gap-2">
                        <select
                          aria-label="Choose a quick raised date filter"
                          value={raisedDateFilter}
                          onChange={(event) => {
                            setRaisedDateFilter(event.target.value);
                            setSelectedRaisedDate(null);
                            setDatePickerOpen(false);
                          }}
                          className={`h-10 min-w-0 flex-1 rounded-md border px-3 text-sm outline-none transition-colors ${pageTheme.field}`}
                        >
                          {raisedDateFilter === "custom" ? (
                            <option value="custom">Custom date</option>
                          ) : null}
                          {raisedDateFilterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          disabled={!hasActiveDateFilter}
                          onClick={clearRaisedDateFilter}
                          className={`h-10 rounded-md border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${pageTheme.button}`}
                        >
                          Clear
                        </button>
                      </div>

                      <div
                        className={`mt-3 rounded-md border ${pageTheme.divider}`}
                      >
                        <Calendar
                          mode="single"
                          selected={selectedRaisedDate || undefined}
                          onSelect={(date) => {
                            if (!date) return;
                            setSelectedRaisedDate(date);
                            setRaisedDateFilter("custom");
                            setDatePickerOpen(false);
                          }}
                          className="mx-auto"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className={`rounded-lg border p-4 ${pageTheme.card}`}
                >
                  <p className={`text-sm font-medium ${pageTheme.muted}`}>
                    {stat.label}
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <h2 className={`text-2xl font-bold ${stat.accent}`}>
                      {stat.value}
                    </h2>
                    <span className={`text-xs ${pageTheme.muted}`}>
                      {stat.detail}
                    </span>
                  </div>
                </article>
              ))}
            </section>

            <section
              className={`overflow-hidden rounded-lg border ${pageTheme.panel}`}
            >
              <div
                className={`border-b px-4 py-4 sm:px-5 ${pageTheme.divider}`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-bold">Recent Complaints</h2>
                  <p className={`text-sm ${pageTheme.muted}`}>
                    {isLoading
                      ? "Loading complaints"
                      : `${recentComplaints.length} of ${filteredComplaints.length} shown`}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
                  <thead className={pageTheme.tableHead}>
                    <tr>
                      <th className="border-b border-inherit px-4 py-3 font-semibold">
                        Name
                      </th>
                      <th className="border-b border-inherit px-4 py-3 font-semibold">
                        Email
                      </th>
                      <th className="border-b border-inherit px-4 py-3 font-semibold">
                        Subject
                      </th>
                      <th className="border-b border-inherit px-4 py-3 font-semibold">
                        Status
                      </th>
                      <th className="border-b border-inherit px-4 py-3 font-semibold">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className={`px-4 py-12 text-center ${pageTheme.muted}`}
                        >
                          Loading...
                        </td>
                      </tr>
                    ) : recentComplaints.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className={`px-4 py-12 text-center ${pageTheme.muted}`}
                        >
                          {search || hasActiveDateFilter
                            ? "No complaints match your filters."
                            : "No complaints found."}
                        </td>
                      </tr>
                    ) : (
                      recentComplaints.map((complaint) => (
                        <tr
                          key={complaint?._id || complaint?.email}
                          className={`transition-colors ${pageTheme.tableRow}`}
                        >
                          <td className="border-b border-inherit px-4 py-3 font-medium">
                            {renderHighlightedText(
                              complaint?.customerId?.name || "-",
                              debouncedSearch,
                              pageTheme.highlight,
                            )}
                          </td>
                          <td className="border-b border-inherit px-4 py-3">
                            {renderHighlightedText(
                              complaint?.customerId?.email || "-",
                              debouncedSearch,
                              pageTheme.highlight,
                            )}
                          </td>
                          <td className="border-b border-inherit px-4 py-3">
                            {renderHighlightedText(
                              complaint?.subject || "-",
                              debouncedSearch,
                              pageTheme.highlight,
                            )}
                          </td>
                          <td className="border-b border-inherit px-4 py-3">
                            <span
                              className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                                complaint?.status,
                                isDarkTheme,
                              )}`}
                            >
                              {renderHighlightedText(
                                formatStatusLabel(complaint?.status),
                                debouncedSearch,
                                pageTheme.highlight,
                              )}
                            </span>
                          </td>
                          <td className="border-b border-inherit px-4 py-3 whitespace-nowrap">
                            {formatDate(
                              complaint?.raisedDate || complaint?.createdAt,
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
