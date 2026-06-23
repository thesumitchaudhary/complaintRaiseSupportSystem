import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Moon, Search, Sun } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "../../../components/app-sidebar";
import { HighlightedText } from "../../../components/HighlightedText";
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
import { DataTable } from "../../../components/DataTable";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import {
  formatDate,
  formatStatusLabel,
  getComplaintSearchText,
  getRaisedDateFilterLabel,
  getRaisedDateParams,
  raisedDateFilterOptions,
} from "../../../lib/complaints";
import { showloggedinuser } from "../../../services/index";
import { getRaisedComplaint } from "../../../services/user";

const renderHighlightedText = (value, searchTerm, highlightClassName) => {
  return (
    <HighlightedText
      value={value}
      searchTerm={searchTerm}
      className={highlightClassName}
    />
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

const MobileComplaintCard = ({
  complaint,
  currentUser,
  debouncedSearch,
  isDarkTheme,
  pageTheme,
}) => {
  const statusLabel = formatStatusLabel(complaint?.status || "pending");
  const details = [
    {
      label: "Name",
      value: complaint?.name || currentUser?.name || "-",
    },
    {
      label: "Email",
      value: complaint?.email || currentUser?.email || "-",
    },
    {
      label: "Raised",
      value: formatDate(complaint?.raisedDate || complaint?.createdAt),
    },
  ];

  return (
    <article className={`p-4 ${pageTheme.row}`}>
      <header className="flex min-w-0 items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 break-words text-sm font-semibold">
          {renderHighlightedText(
            complaint?.subject || "Untitled complaint",
            debouncedSearch,
            pageTheme.highlight,
          )}
        </h3>
        <span
          className={`inline-flex shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${getStatusClasses(
            complaint?.status,
            isDarkTheme,
          )}`}
        >
          {renderHighlightedText(
            statusLabel,
            debouncedSearch,
            pageTheme.highlight,
          )}
        </span>
      </header>

      <p className={`mt-3 break-words text-sm leading-6 ${pageTheme.muted}`}>
        {renderHighlightedText(
          complaint?.message || "-",
          debouncedSearch,
          pageTheme.highlight,
        )}
      </p>

      <dl className="mt-4 grid gap-3 min-[480px]:grid-cols-2">
        {details.map((detail) => (
          <div key={detail.label} className="min-w-0">
            <dt
              className={`text-xs font-medium uppercase tracking-wide ${pageTheme.muted}`}
            >
              {detail.label}
            </dt>
            <dd className="mt-1 break-all text-sm">
              {renderHighlightedText(
                detail.value,
                debouncedSearch,
                pageTheme.highlight,
              )}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
};

export default function Page() {
  const [theme, setTheme] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, { lowercase: true });
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
        highlight: "bg-yellow-300 text-slate-950",
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
        highlight: "bg-yellow-200 text-slate-950",
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

  const complaintColumns = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        cellClassName: "font-medium",
        render: (complaint) =>
          renderHighlightedText(
            complaint?.name || currentUser?.name || "-",
            debouncedSearch,
            pageTheme.highlight,
          ),
      },
      {
        key: "email",
        header: "Email",
        render: (complaint) =>
          renderHighlightedText(
            complaint?.email || currentUser?.email || "-",
            debouncedSearch,
            pageTheme.highlight,
          ),
      },
      {
        key: "subject",
        header: "Subject",
        render: (complaint) =>
          renderHighlightedText(
            complaint?.subject || "-",
            debouncedSearch,
            pageTheme.highlight,
          ),
      },
      {
        key: "message",
        header: "Message",
        cellClassName: "max-w-sm",
        render: (complaint) => (
          <p className="line-clamp-2">
            {renderHighlightedText(
              complaint?.message || "-",
              debouncedSearch,
              pageTheme.highlight,
            )}
          </p>
        ),
      },
      {
        key: "raisedDate",
        header: "Raised Date",
        cellClassName: "whitespace-nowrap",
        render: (complaint) =>
          renderHighlightedText(
            formatDate(complaint?.raisedDate || complaint?.createdAt),
            debouncedSearch,
            pageTheme.highlight,
          ),
      },
      {
        key: "status",
        header: "Status",
        render: (complaint) => {
          const statusLabel = formatStatusLabel(
            complaint?.status || "pending",
          );

          return (
            <span
              className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${getStatusClasses(
                complaint?.status,
                isDarkTheme,
              )}`}
            >
              {renderHighlightedText(
                statusLabel,
                debouncedSearch,
                pageTheme.highlight,
              )}
            </span>
          );
        },
      },
    ],
    [
      currentUser?.email,
      currentUser?.name,
      debouncedSearch,
      isDarkTheme,
      pageTheme.highlight,
    ],
  );

  const filteredComplaints = useMemo(() => {
    if (!debouncedSearch) return complaints;

    return complaints.filter((ticket) => {
      return getComplaintSearchText(ticket).includes(debouncedSearch);
    });
  }, [complaints, debouncedSearch]);

  const suggestions = useMemo(() => {
    const needle = debouncedSearch;

    if (!needle) return [];

    return complaints
      .filter((ticket) =>
        String(ticket?.subject || "")
          .toLowerCase()
          .includes(needle),
      )
      .slice(0, 5);
  }, [complaints, debouncedSearch]);

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
    <section
      aria-label="Customer support dashboard"
      className={`${pageTheme.shell} min-h-screen overflow-x-hidden`}
    >
      <SidebarProvider style={{ backgroundColor: "transparent" }}>
        <AppSidebar />
        <SidebarInset
          className="min-w-0"
          style={{ backgroundColor: "transparent" }}
        >
          <header
            className={`sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b ${pageTheme.header}`}
          >
            <section
              aria-label="Dashboard toolbar"
              className="flex min-w-0 w-full items-center justify-between gap-3 px-3 sm:px-4"
            >
              <section
                aria-label="Dashboard navigation controls"
                className="flex min-w-0 items-center gap-2"
              >
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-1 data-[orientation=vertical]:h-4 sm:mr-2"
                />
                <Breadcrumb className="min-w-0">
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
                      <BreadcrumbPage
                        className={`truncate text-sm ${pageTheme.muted}`}
                      >
                        Overview
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </section>

              <button
                type="button"
                aria-label="Toggle theme"
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition-colors ${pageTheme.button}`}
                onClick={() => setTheme((prev) => !prev)}
              >
                {isDarkTheme ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>
            </section>
          </header>

          <section
            aria-labelledby="dashboard-title"
            className="mx-auto flex min-w-0 w-full max-w-7xl flex-1 flex-col gap-5 p-3 sm:gap-6 sm:p-4 lg:p-6"
          >
            <section
              aria-labelledby="dashboard-title"
              className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"
            >
              <header className="min-w-0">
                <h1
                  id="dashboard-title"
                  className="text-xl font-bold tracking-normal sm:text-2xl"
                >
                  Dashboard
                </h1>
                <p className={`mt-1 text-sm ${pageTheme.muted}`}>
                  Review your complaint activity and quickly filter the current
                  queue.
                </p>
              </header>

              <form
                aria-label="Complaint filters"
                className="flex min-w-0 w-full flex-col gap-3 sm:flex-row sm:items-center xl:w-auto"
                onSubmit={(event) => event.preventDefault()}
              >
                <search className="relative min-w-0 w-full sm:flex-1 xl:w-80 xl:flex-none">
                  <Search
                    className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${pageTheme.muted}`}
                  />
                  <Input
                    type="search"
                    aria-label="Search complaints"
                    aria-controls={
                      suggestions.length > 0
                        ? "complaint-search-suggestions"
                        : undefined
                    }
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search complaints"
                    className={`pl-9 ${pageTheme.field}`}
                  />

                  {suggestions.length > 0 ? (
                    <ul
                      id="complaint-search-suggestions"
                      aria-label="Complaint search suggestions"
                      className={`absolute left-0 top-full z-50 mt-1 w-full rounded-md border shadow-lg ${pageTheme.panel}`}
                    >
                      {suggestions.map((item) => (
                        <li key={item?._id}>
                          <button
                            type="button"
                            className={`block w-full px-3 py-2 text-left text-sm transition-colors ${pageTheme.suggestionHover}`}
                            onClick={() => setSearch(item?.subject || "")}
                          >
                            {renderHighlightedText(
                              item?.subject || "Untitled complaint",
                              debouncedSearch,
                              pageTheme.highlight,
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </search>

                <section
                  aria-label="Raised date filter"
                  className="relative min-w-0 w-full sm:w-64 sm:shrink-0"
                >
                  <CalendarDays
                    className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${pageTheme.muted}`}
                  />
                  <button
                    type="button"
                    aria-expanded={datePickerOpen}
                    aria-controls="raised-date-options"
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
                    <aside
                      id="raised-date-options"
                      aria-label="Raised date options"
                      className={`absolute left-0 top-full z-50 mt-2 w-full rounded-lg border p-2 shadow-xl sm:left-auto sm:right-0 sm:w-80 sm:p-3 ${pageTheme.panel}`}
                    >
                      <fieldset className="flex min-w-0 gap-2 border-0 p-0">
                        <legend className="sr-only">
                          Quick raised date range
                        </legend>
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
                      </fieldset>

                      <section
                        aria-label="Choose a specific raised date"
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
                          className="mx-auto max-w-full p-1 sm:p-3"
                          classNames={{
                            weekday:
                              "w-8 rounded-md text-center text-[0.75rem] font-normal text-muted-foreground sm:w-9 sm:text-[0.8rem]",
                            day: "relative size-8 p-0 text-center text-sm sm:size-9",
                            day_button:
                              "inline-flex size-8 items-center justify-center rounded-md text-sm font-normal transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:size-9",
                          }}
                        />
                      </section>
                    </aside>
                  ) : null}
                </section>
              </form>
            </section>

            <section
              aria-labelledby="complaint-statistics-title"
              className="grid gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4"
            >
              <h2 id="complaint-statistics-title" className="sr-only">
                Complaint statistics
              </h2>
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className={`rounded-lg border p-4 ${pageTheme.card}`}
                >
                  <h3 className={`text-sm font-medium ${pageTheme.muted}`}>
                    {stat.label}
                  </h3>
                  <footer className="mt-2 flex items-end justify-between gap-3">
                    <p className={`text-2xl font-bold ${stat.accent}`}>
                      {stat.value}
                    </p>
                    <span
                      className={`max-w-36 text-right text-xs ${pageTheme.muted}`}
                    >
                      {stat.helper}
                    </span>
                  </footer>
                </article>
              ))}
            </section>

            <section
              aria-labelledby="complaints-title"
              className={`overflow-hidden rounded-lg border ${pageTheme.panel}`}
            >
              <header
                className={`flex flex-col gap-2 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${pageTheme.divider}`}
              >
                <h2 id="complaints-title" className="text-lg font-bold">
                  Your Complaints
                </h2>
                <p className={`text-sm ${pageTheme.muted}`} aria-live="polite">
                  {isLoading
                    ? "Loading complaints"
                    : `${filteredComplaints.length} of ${totalComplaints} shown`}
                </p>
              </header>

              {filteredComplaints.length > 0 ? (
                <>
                  <ul aria-label="Complaints" className="divide-y lg:hidden">
                    {filteredComplaints.map((complaint, index) => (
                      <li key={complaint?._id || complaint?.id || index}>
                        <MobileComplaintCard
                          complaint={complaint}
                          currentUser={currentUser}
                          debouncedSearch={debouncedSearch}
                          isDarkTheme={isDarkTheme}
                          pageTheme={pageTheme}
                        />
                      </li>
                    ))}
                  </ul>

                  <section
                    aria-label="Complaint table"
                    className="hidden overflow-x-auto lg:block"
                  >
                    <DataTable
                      columns={complaintColumns}
                      data={filteredComplaints}
                      tableClassName="min-w-[760px] border-separate border-spacing-0 text-left text-sm"
                      headerClassName={pageTheme.tableHead}
                      rowClassName={`transition-colors ${pageTheme.row}`}
                    />
                  </section>
                </>
              ) : (
                <p
                  className={`px-4 py-12 text-center ${pageTheme.muted}`}
                  role="status"
                >
                  {isLoading
                    ? "Loading complaints..."
                    : search
                      ? "No complaints match your search."
                      : "No complaints raised yet."}
                </p>
              )}
            </section>
          </section>
        </SidebarInset>
      </SidebarProvider>
    </section>
  );
}
