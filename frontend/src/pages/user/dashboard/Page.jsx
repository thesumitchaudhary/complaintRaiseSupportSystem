import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Moon, Search, Sun } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "../../../components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../components/ui/breadcrumb";
import { Calendar } from "../../../components/ui/calendar";
import { Input } from "../../../components/ui/input";
import { Separator } from "../../../components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import { showloggedinuser } from "../../../services/index";
import { getRaisedComplaint } from "../../../services/user";

const formatLabel = (value) => {
  if (!value) return "-";

  return String(value)
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

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

const getRaisedDateParams = (filterValue, customDate) => {
  const today = new Date();
  const endDate = endOfDay(today);
  let startDate;

  if (filterValue === "custom" && customDate) {
    return {
      startDate: startOfDay(customDate).toISOString(),
      endDate: endOfDay(customDate).toISOString(),
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

  if (!startDate) return {};

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
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

const getStatusClasses = (status, isDarkTheme) => {
  const normalizedStatus = String(status || "").toLowerCase();

  if (["completed", "resolved"].includes(normalizedStatus)) {
    return isDarkTheme
      ? "bg-emerald-950 text-emerald-200"
      : "bg-emerald-100 text-emerald-700";
  }

  if (normalizedStatus === "pending") {
    return isDarkTheme
      ? "bg-amber-950 text-amber-200"
      : "bg-amber-100 text-amber-700";
  }

  if (["assigned", "in_progress"].includes(normalizedStatus)) {
    return isDarkTheme
      ? "bg-sky-950 text-sky-200"
      : "bg-blue-100 text-blue-700";
  }

  if (normalizedStatus === "rejected") {
    return isDarkTheme ? "bg-red-950 text-red-200" : "bg-red-100 text-red-700";
  }

  return isDarkTheme
    ? "bg-slate-800 text-slate-200"
    : "bg-slate-100 text-slate-700";
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
        row: "border-blue-900/40 hover:bg-slate-800/70",
        field:
          "border-blue-900/70 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500",
        divider: "border-blue-900/60",
        muted: "text-slate-400",
        button: "border-blue-900/70 text-slate-100 hover:bg-slate-800",
        suggestionHover: "hover:bg-slate-800",
      }
    : {
        shell: "bg-[#f8fbff] text-[#001a3a]",
        header: "border-[#c7ddff] bg-white",
        panel: "border-[#b8d8ff] bg-white text-[#001a3a]",
        card: "border-[#b8d8ff] bg-[#eef6ff] text-[#12365c] shadow-[0_14px_24px_-20px_rgba(37,99,235,0.95)]",
        tableHead: "bg-[#f8fbff] text-[#001a3a]",
        row: "border-[#c7ddff] hover:bg-[#f2f7ff]",
        field:
          "border-[#b8d8ff] bg-white text-[#001a3a] placeholder:text-[#6a7f9e] focus-visible:ring-blue-400",
        divider: "border-[#c7ddff]",
        muted: "text-[#4e678a]",
        button: "border-[#b8d8ff] text-[#12365c] hover:bg-[#eef6ff]",
        suggestionHover: "hover:bg-[#eef6ff]",
      };

  const raisedDateParams = useMemo(
    () => getRaisedDateParams(raisedDateFilter, selectedRaisedDate),
    [raisedDateFilter, selectedRaisedDate],
  );
  const raisedDateFilterLabel = useMemo(
    () => getRaisedDateFilterLabel(raisedDateFilter, selectedRaisedDate),
    [raisedDateFilter, selectedRaisedDate],
  );
  const hasActiveDateFilter =
    raisedDateFilter !== "all" || Boolean(selectedRaisedDate);
  const complaintFilters = useMemo(
    () => ({
      ...raisedDateParams,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [debouncedSearch, raisedDateParams],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: [
      "showRaisedTicket",
      raisedDateFilter,
      selectedRaisedDate?.toISOString(),
      debouncedSearch,
    ],
    queryFn: () => getRaisedComplaint(complaintFilters),
  });

  const { data: userData } = useQuery({
    queryKey: ["showloginuser"],
    queryFn: showloggedinuser,
  });

  const complaints = useMemo(
    () => (Array.isArray(data?.result) ? data.result : []),
    [data],
  );
  const currentUser = userData?.result;

  const filteredComplaints = useMemo(() => {
    if (!debouncedSearch) return complaints;

    return complaints.filter((ticket) => {
      const searchableText = [
        ticket?.name,
        ticket?.email,
        ticket?.subject,
        ticket?.message,
        ticket?.status,
        ticket?.serviceType,
        ticket?.raisedDate,
        ticket?.createdAt,
        ticket?._id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(debouncedSearch);
    });
  }, [complaints, debouncedSearch]);

  const suggestions = useMemo(() => {
    const needle = search.trim().toLowerCase();

    if (!needle) return [];

    return complaints
      .filter((ticket) =>
        String(ticket?.subject || "")
          .toLowerCase()
          .includes(needle),
      )
      .slice(0, 5);
  }, [complaints, search]);

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter((ticket) =>
    ["completed", "resolved"].includes(
      String(ticket?.status || "").toLowerCase(),
    ),
  ).length;
  const activeComplaints = complaints.filter((ticket) =>
    ["assigned", "in_progress"].includes(
      String(ticket?.status || "").toLowerCase(),
    ),
  ).length;
  const pendingComplaints = complaints.filter(
    (ticket) => String(ticket?.status || "").toLowerCase() === "pending",
  ).length;

  const clearRaisedDateFilter = () => {
    setRaisedDateFilter("all");
    setSelectedRaisedDate(null);
    setDatePickerOpen(false);
  };

  const stats = [
    {
      label: "Total Complaints",
      value: totalComplaints,
      helper: "All raised complaints",
      accent: isDarkTheme ? "text-blue-300" : "text-blue-600",
    },
    {
      label: "Resolved",
      value: resolvedComplaints,
      helper: "Completed complaints",
      accent: isDarkTheme ? "text-emerald-300" : "text-emerald-600",
    },
    {
      label: "In Progress",
      value: activeComplaints,
      helper: "Currently being handled",
      accent: isDarkTheme ? "text-sky-300" : "text-sky-600",
    },
    {
      label: "Pending",
      value: pendingComplaints,
      helper: "Waiting for resolution",
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
                        Customer Dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className={`text-sm ${pageTheme.muted}`}>
                        Overview
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <button
                type="button"
                aria-label="Toggle theme"
                className={`inline-flex h-10 w-10 items-center justify-center rounded-md border transition-colors ${pageTheme.button}`}
                onClick={() => setTheme((prev) => !prev)}
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
                  Dashboard
                </h1>
                <p className={`mt-1 text-sm ${pageTheme.muted}`}>
                  Review your complaint activity and quickly filter the current
                  queue.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-80">
                  <Search
                    className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${pageTheme.muted}`}
                  />
                  <Input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search complaints"
                    className={`pl-9 ${pageTheme.field}`}
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
                          {item?.subject || "Untitled complaint"}
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
                      {stat.helper}
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
                  <h2 className="text-lg font-bold">Your Complaints</h2>
                  <p className={`text-sm ${pageTheme.muted}`}>
                    {isLoading
                      ? "Loading complaints"
                      : `${filteredComplaints.length} of ${totalComplaints} shown`}
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
                        Message
                      </th>
                      <th className="border-b border-inherit px-4 py-3 font-semibold">
                        Raised Date
                      </th>
                      <th className="border-b border-inherit px-4 py-3 font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.length > 0 ? (
                      filteredComplaints.map((complaint) => (
                        <tr
                          key={complaint?._id}
                          className={`transition-colors ${pageTheme.row}`}
                        >
                          <td className="border-b border-inherit px-4 py-3 font-medium">
                            {complaint?.name || currentUser?.name || "-"}
                          </td>
                          <td className="border-b border-inherit px-4 py-3">
                            {complaint?.email || currentUser?.email || "-"}
                          </td>
                          <td className="border-b border-inherit px-4 py-3">
                            {complaint?.subject || "-"}
                          </td>
                          <td className="max-w-sm border-b border-inherit px-4 py-3">
                            <p className="line-clamp-2">
                              {complaint?.message || "-"}
                            </p>
                          </td>
                          <td className="border-b border-inherit px-4 py-3 whitespace-nowrap">
                            {formatDate(
                              complaint?.raisedDate || complaint?.createdAt,
                            )}
                          </td>
                          <td className="border-b border-inherit px-4 py-3">
                            <span
                              className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${getStatusClasses(
                                complaint?.status,
                                isDarkTheme,
                              )}`}
                            >
                              {formatLabel(complaint?.status || "pending")}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className={`px-4 py-12 text-center ${pageTheme.muted}`}
                        >
                          {isLoading
                            ? "Loading complaints..."
                            : search
                              ? "No complaints match your search."
                              : "No complaints raised yet."}
                        </td>
                      </tr>
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
