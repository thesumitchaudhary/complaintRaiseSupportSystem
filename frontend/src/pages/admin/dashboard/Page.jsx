import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "../../../components/admin-app-sidebar";
import { DashboardShell } from "../../../components/DashboardShell";
import { HighlightedText } from "../../../components/HighlightedText";
import { Calendar } from "../../../components/ui/calendar";
import { DataTable } from "../../../components/DataTable";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useDocumentTheme } from "../../../hooks/useDocumentTheme";
import {
  formatDate,
  formatStatusLabel,
  getComplaintDate,
  getComplaintSearchText,
  getRaisedDateFilterLabel,
  getRaisedDateRange,
  getStatusBadgeClass,
  raisedDateFilterOptions,
} from "../../../lib/complaints";
import { showComplain, showEmployee, showUser } from "../../../services/admin";

const renderHighlightedText = (value, searchTerm, highlightClassName) => {
  return (
    <HighlightedText
      value={value}
      searchTerm={searchTerm}
      className={highlightClassName}
    />
  );
};

export default function Page() {
  const [theme, setTheme] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, {
    delay: 500,
    lowercase: true,
  });
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

  useDocumentTheme(isDarkTheme);

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

      return getComplaintSearchText(complaint).includes(debouncedSearch);
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

  const complaintColumns = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        cellClassName: "font-medium",
        render: (complaint) =>
          renderHighlightedText(
            complaint?.customerId?.name || "-",
            debouncedSearch,
            pageTheme.highlight,
          ),
      },
      {
        key: "email",
        header: "Email",
        render: (complaint) =>
          renderHighlightedText(
            complaint?.customerId?.email || "-",
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
        key: "status",
        header: "Status",
        render: (complaint) => (
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
        ),
      },
      {
        key: "date",
        header: "Date",
        cellClassName: "whitespace-nowrap",
        render: (complaint) =>
          formatDate(complaint?.raisedDate || complaint?.createdAt),
      },
    ],
    [debouncedSearch, isDarkTheme, pageTheme.highlight],
  );

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
    <DashboardShell
      sidebar={<AppSidebar />}
      sectionLabel="Admin dashboard"
      pageLabel="Dashboard"
      pageTheme={pageTheme}
      isDarkTheme={isDarkTheme}
      onToggleTheme={() => setTheme((currentTheme) => !currentTheme)}
    >
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
                <DataTable
                  columns={complaintColumns}
                  data={recentComplaints}
                  isLoading={isLoading}
                  emptyMessage={
                    search || hasActiveDateFilter
                      ? "No complaints match your filters."
                      : "No complaints found."
                  }
                  tableClassName="min-w-[760px] border-separate border-spacing-0 text-left text-sm"
                  headerClassName={pageTheme.tableHead}
                  headerCellClassName="border-b border-inherit px-4 py-3 font-semibold"
                  rowClassName={`transition-colors ${pageTheme.tableRow}`}
                  cellClassName="border-b border-inherit px-4 py-3"
                  emptyClassName={`px-4 py-12 ${pageTheme.muted}`}
                />
              </div>
            </section>
      </main>
    </DashboardShell>
  );
}
