import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Moon,
  PlusCircle,
  Search,
  Sun,
  MoveUpRight,
  X,
} from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
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
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Separator } from "../../../components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import { RaiseComplaintModal } from "../../../components/RaiseComplaintModal";
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
      ? "border-emerald-700 bg-emerald-950 text-emerald-200"
      : "border-transparent bg-emerald-100 text-emerald-700";
  }

  if (normalizedStatus === "pending") {
    return isDarkTheme
      ? "border-amber-700 bg-amber-950 text-amber-200"
      : "border-transparent bg-orange-100 text-orange-600";
  }

  if (["assigned", "in_progress"].includes(normalizedStatus)) {
    return isDarkTheme
      ? "border-sky-700 bg-sky-950 text-sky-200"
      : "border-transparent bg-blue-100 text-blue-700";
  }

  if (normalizedStatus === "rejected") {
    return isDarkTheme
      ? "border-red-700 bg-red-950 text-red-200"
      : "border-transparent bg-red-100 text-red-700";
  }

  return isDarkTheme
    ? "border-slate-700 bg-slate-900 text-slate-200"
    : "border-transparent bg-blue-100 text-blue-700";
};

export default function Page() {
  const [theme, setTheme] = useState(false);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [raisedDateFilter, setRaisedDateFilter] = useState("all");
  const [selectedRaisedDate, setSelectedRaisedDate] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const isDarkTheme = theme;
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
      "showRaisedTicked",
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

  const detailTheme = isDarkTheme
    ? {
        overlay: "bg-slate-950/70",
        modal: "border-blue-900/70 bg-slate-900 text-slate-100",
        header: "border-blue-900/60 bg-slate-950/90",
        body: "bg-slate-900",
        surface: "border-blue-900/60 bg-slate-950/60",
        surfaceAlt: "border-blue-900/50 bg-slate-900/80",
        label: "text-slate-400",
        muted: "text-slate-300",
        close: "border-blue-900/70 text-slate-100 hover:bg-slate-800",
        scrollbarStyle: {
          "--complaint-scroll-thumb": "#3b82f6",
          "--complaint-scroll-track": "#0f172a",
          "--complaint-scroll-thumb-hover": "#60a5fa",
        },
      }
    : {
        overlay: "bg-[#001a3a]/35",
        modal: "border-[#b8d8ff] bg-white text-[#001a3a]",
        header: "border-[#c7ddff] bg-[#f8fbff]",
        body: "bg-white",
        surface: "border-[#c7ddff] bg-[#f8fbff]",
        surfaceAlt: "border-[#b8d8ff] bg-[#eef6ff]",
        label: "text-[#4e678a]",
        muted: "text-[#4e678a]",
        close: "border-[#b8d8ff] text-[#12365c] hover:bg-[#eef6ff]",
        scrollbarStyle: {
          "--complaint-scroll-thumb": "#2563eb",
          "--complaint-scroll-track": "#dbeafe",
          "--complaint-scroll-thumb-hover": "#1d4ed8",
        },
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
      accent: isDarkTheme ? "text-blue-300" : "text-blue-600",
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
                        My Complaints
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
            <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-normal">
                  My Complaints
                </h1>
                <p className={`mt-1 text-sm ${pageTheme.muted}`}>
                  Track every complaint you have raised and see the latest
                  status in one place.
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

                <Button
                  type="button"
                  className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setComplaintModalOpen(true)}
                >
                  <PlusCircle className="h-4 w-4" />
                  Raise Complaint
                </Button>
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
                        View More
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.length > 0 ? (
                      filteredComplaints.map((ticket) => (
                        <tr
                          key={ticket?._id}
                          className={`transition-colors ${pageTheme.row}`}
                        >
                          <td className="border-b border-inherit px-4 py-3 font-medium">
                            {ticket?.name || currentUser?.name || "-"}
                          </td>
                          <td className="border-b border-inherit px-4 py-3">
                            {ticket?.email || currentUser?.email || "-"}
                          </td>
                          <td className="border-b border-inherit px-4 py-3">
                            {ticket?.subject || "-"}
                          </td>
                          <td className="max-w-sm border-b border-inherit px-4 py-3">
                            <p className="line-clamp-2">
                              {ticket?.message || "-"}
                            </p>
                          </td>
                          <td className="border-b border-inherit px-4 py-3 whitespace-nowrap">
                            {formatDate(
                              ticket?.raisedDate || ticket?.createdAt,
                            )}
                          </td>
                          <td className="border-b border-inherit px-4 py-3">
                            <button
                              type="button"
                              aria-label={`View details for ${ticket?.subject || "complaint"}`}
                              onClick={() => setSelectedComplaint(ticket)}
                              className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${pageTheme.button}`}
                            >
                              <span className="inline-flex text-xs font-semibold">
                                <MoveUpRight className="h-4 w-4" />
                              </span>
                            </button>
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

      <RaiseComplaintModal
        open={complaintModalOpen}
        onOpenChange={setComplaintModalOpen}
        theme={isDarkTheme}
      />

      <DialogPrimitive.Root
        open={Boolean(selectedComplaint)}
        onOpenChange={(open) => !open && setSelectedComplaint(null)}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            className={`fixed inset-0 z-50 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 ${detailTheme.overlay}`}
          />
          <DialogPrimitive.Content
            className={`fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border shadow-2xl outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 ${detailTheme.modal}`}
          >
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Close complaint details"
                className={`absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${detailTheme.close}`}
              >
                <X className="h-4 w-4" />
              </button>
            </DialogPrimitive.Close>

            <div className={`border-b px-6 py-5 ${detailTheme.header}`}>
              <div className="space-y-2 text-left">
                <div className="flex items-start justify-between gap-4 pr-10">
                  <div>
                    <DialogPrimitive.Title className="text-xl font-bold">
                      Complaint Details
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description
                      className={`text-sm ${detailTheme.muted}`}
                    >
                      Full information for the selected complaint.
                    </DialogPrimitive.Description>
                  </div>

                  {selectedComplaint ? (
                    <span
                      className={`inline-flex rounded-md border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        selectedComplaint?.status,
                        isDarkTheme,
                      )}`}
                    >
                      {formatLabel(selectedComplaint?.status || "pending")}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {selectedComplaint ? (
              <div
                className={`complaint-details-scrollbar space-y-5 overflow-y-auto px-6 py-5 ${detailTheme.body}`}
                style={detailTheme.scrollbarStyle}
              >
                <section
                  className={`rounded-lg border p-4 ${detailTheme.surface}`}
                >
                  <p
                    className={`text-xs font-semibold uppercase ${detailTheme.label}`}
                  >
                    Subject
                  </p>
                  <h3 className="mt-2 text-lg font-bold">
                    {selectedComplaint?.subject || "Untitled complaint"}
                  </h3>
                  <p className={`mt-2 text-sm ${detailTheme.muted}`}>
                    Ticket ID: {selectedComplaint?._id || "-"}
                  </p>
                </section>

                <section className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      label: "Name",
                      value:
                        selectedComplaint?.name || currentUser?.name || "-",
                    },
                    {
                      label: "Email",
                      value:
                        selectedComplaint?.email || currentUser?.email || "-",
                    },
                    {
                      label: "Service Type",
                      value: formatLabel(selectedComplaint?.serviceType),
                    },
                    {
                      label: "Priority",
                      value: formatLabel(
                        selectedComplaint?.priority || "medium",
                      ),
                    },
                    {
                      label: "Raised Date",
                      value: formatDate(
                        selectedComplaint?.raisedDate ||
                          selectedComplaint?.createdAt,
                      ),
                    },
                    {
                      label: "Assigned Date",
                      value: formatDate(selectedComplaint?.assignedDate),
                    },
                    {
                      label: "Due Date",
                      value: formatDate(selectedComplaint?.deadline),
                    },
                    {
                      label: "Completed Date",
                      value: formatDate(selectedComplaint?.completedDate),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-lg border p-3 ${detailTheme.surfaceAlt}`}
                    >
                      <p
                        className={`text-xs font-semibold uppercase ${detailTheme.label}`}
                      >
                        {item.label}
                      </p>
                      <p className="mt-1 break-words font-medium">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </section>

                {selectedComplaint?.task?.title ||
                selectedComplaint?.task?.notes ? (
                  <section
                    className={`rounded-lg border p-4 ${detailTheme.surfaceAlt}`}
                  >
                    <p
                      className={`text-xs font-semibold uppercase ${detailTheme.label}`}
                    >
                      Assigned Task
                    </p>
                    <p className="mt-2 font-semibold">
                      {selectedComplaint?.task?.title || "-"}
                    </p>
                    <p
                      className={`mt-2 text-sm leading-6 ${detailTheme.muted}`}
                    >
                      {selectedComplaint?.task?.notes || "No task notes added."}
                    </p>
                  </section>
                ) : null}

                <section
                  className={`rounded-lg border p-4 ${detailTheme.surface}`}
                >
                  <p
                    className={`text-xs font-semibold uppercase ${detailTheme.label}`}
                  >
                    Message
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                    {selectedComplaint?.message || "-"}
                  </p>
                </section>

                {selectedComplaint?.resolutionNote ? (
                  <section
                    className={`rounded-lg border p-4 ${detailTheme.surface}`}
                  >
                    <p
                      className={`text-xs font-semibold uppercase ${detailTheme.label}`}
                    >
                      Resolution Note
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                      {selectedComplaint.resolutionNote}
                    </p>
                  </section>
                ) : null}

                {Array.isArray(selectedComplaint?.workUpdates) &&
                selectedComplaint.workUpdates.length > 0 ? (
                  <section
                    className={`rounded-lg border p-4 ${detailTheme.surface}`}
                  >
                    <p
                      className={`text-xs font-semibold uppercase ${detailTheme.label}`}
                    >
                      Work Updates
                    </p>
                    <div className="mt-3 space-y-3">
                      {selectedComplaint.workUpdates.map((update, index) => (
                        <div
                          key={update?._id || `${update?.updatedAt}-${index}`}
                          className={`rounded-md border p-3 ${detailTheme.surfaceAlt}`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span
                              className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${getStatusClasses(
                                update?.status,
                                isDarkTheme,
                              )}`}
                            >
                              {formatLabel(update?.status || "update")}
                            </span>
                            <span className={`text-xs ${detailTheme.muted}`}>
                              {formatDate(update?.updatedAt)}
                            </span>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                            {update?.message || "-"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            ) : null}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
