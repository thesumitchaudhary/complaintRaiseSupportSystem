import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Loader2,
  Search,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppSidebar } from "../../../components/admin-app-sidebar";
import { DashboardShell } from "../../../components/DashboardShell";
import { HighlightedText } from "../../../components/HighlightedText";
import { Calendar } from "../../../components/ui/calendar";
import {
  deleteComplaint,
  showComplain,
  updateComplaint,
} from "../../../services/admin";
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
  getStatusKey,
  raisedDateFilterOptions,
} from "../../../lib/complaints";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";

const renderHighlightedText = (value, searchTerm, highlightClassName) => {
  return (
    <HighlightedText
      value={value}
      searchTerm={searchTerm}
      className={highlightClassName}
    />
  );
};

const PAGE_SIZE = 2;

export default function Page() {
  const [theme, setTheme] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, { lowercase: true });
  const [raisedDateFilter, setRaisedDateFilter] = useState("all");
  const [selectedRaisedDate, setSelectedRaisedDate] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const isDarkTheme = theme;
  const queryClient = useQueryClient();

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
        menu: "border-blue-900/70 bg-slate-900 text-slate-100",
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
        menu: "border-[#b8d8ff] bg-white text-[#001a3a]",
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

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateComplaint(id, { status }),
    onSuccess: () => {
      toast.success("Complaint status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["showComplaints"] });
    },
    onError: (error) => {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Failed to update complaint",
      );
    },
  });

  const deleteComplaintMutation = useMutation({
    mutationFn: deleteComplaint,
    onSuccess: () => {
      toast.success("Complaint deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["showComplaints"] });
    },
    onError: (error) => {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Failed to delete complaint",
      );
    },
  });

  const complaints = useMemo(
    () => (Array.isArray(data?.result) ? data.result : []),
    [data],
  );

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

  const totalComplaints = complaints.length;
  const filteredComplaintCount = filteredComplaints.length;
  const totalPages = Math.max(Math.ceil(filteredComplaintCount / PAGE_SIZE), 1);
  const activePage = Math.min(currentPage, totalPages);
  const paginatedComplaints = useMemo(() => {
    const pageStart = (activePage - 1) * PAGE_SIZE;

    return filteredComplaints.slice(pageStart, pageStart + PAGE_SIZE);
  }, [activePage, filteredComplaints]);
  const firstShownComplaint =
    filteredComplaintCount > 0 ? (activePage - 1) * PAGE_SIZE + 1 : 0;
  const lastShownComplaint = Math.min(
    activePage * PAGE_SIZE,
    filteredComplaintCount,
  );
  const resolvedComplaints = complaints.filter((complaint) =>
    ["completed", "resolved"].includes(getStatusKey(complaint?.status)),
  ).length;
  const inProgressComplaints = complaints.filter((complaint) =>
    ["assigned", "in_progress"].includes(getStatusKey(complaint?.status)),
  ).length;
  const pendingComplaints = complaints.filter(
    (complaint) => getStatusKey(complaint?.status) === "pending",
  ).length;

  const clearRaisedDateFilter = () => {
    setRaisedDateFilter("all");
    setSelectedRaisedDate(null);
    setDatePickerOpen(false);
    setCurrentPage(1);
  };

  const summaryCards = [
    {
      label: "Total Complaints",
      value: totalComplaints,
      detail: "All raised complaints",
      accent: isDarkTheme ? "text-blue-300" : "text-blue-600",
    },
    {
      label: "Resolved",
      value: resolvedComplaints,
      detail: "Completed complaints",
      accent: isDarkTheme ? "text-emerald-300" : "text-emerald-600",
    },
    {
      label: "In Progress",
      value: inProgressComplaints,
      detail: "Currently being handled",
      accent: isDarkTheme ? "text-sky-300" : "text-blue-600",
    },
    {
      label: "Pending",
      value: pendingComplaints,
      detail: "Waiting for resolution",
      accent: isDarkTheme ? "text-orange-300" : "text-orange-500",
    },
  ];

  const isMutating =
    updateStatusMutation.isPending || deleteComplaintMutation.isPending;

  const renderComplaintActions = (complaint) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={`Open actions for ${complaint?.subject || "complaint"}`}
          className={`h-9 w-9 rounded-md p-0 ${pageTheme.button}`}
        >
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={`w-40 ${pageTheme.menu}`} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() =>
              updateStatusMutation.mutate({
                id: complaint?._id,
                status: "pending",
              })
            }
          >
            Pending
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              updateStatusMutation.mutate({
                id: complaint?._id,
                status: "in_progress",
              })
            }
          >
            In Progress
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              updateStatusMutation.mutate({
                id: complaint?._id,
                status: "completed",
              })
            }
          >
            Resolved
          </DropdownMenuItem>
          <DropdownMenuItem
            className={
              isDarkTheme
                ? "text-red-300 focus:text-red-200"
                : "text-red-600 focus:text-red-700"
            }
            onClick={() => deleteComplaintMutation.mutate(complaint?._id)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <DashboardShell
      sidebar={<AppSidebar />}
      sectionLabel="Admin dashboard"
      pageLabel="Complaints"
      pageTheme={pageTheme}
      isDarkTheme={isDarkTheme}
      onToggleTheme={() => setTheme((currentTheme) => !currentTheme)}
    >
      {isMutating ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            className={`flex flex-col items-center gap-3 rounded-lg border p-6 shadow-lg ${pageTheme.panel}`}
          >
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-medium">
              {deleteComplaintMutation.isPending
                ? "Deleting complaint..."
                : "Updating complaint..."}
            </p>
          </div>
        </div>
      ) : null}

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 lg:p-6">
        <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-normal">
              Complaints overview
            </h1>
            <p className={`mt-1 max-w-2xl text-sm ${pageTheme.muted}`}>
              Track every customer complaint and update the latest status in one
              place.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-96">
              <Search
                className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${pageTheme.muted}`}
              />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
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
                      onClick={() => {
                        setSearch(item?.subject || "");
                        setCurrentPage(1);
                      }}
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
                        setCurrentPage(1);
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
                        setCurrentPage(1);
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
          {summaryCards.map((card) => (
            <article
              key={card.label}
              className={`min-h-32 rounded-lg border p-5 ${pageTheme.card}`}
            >
              <p className={`text-sm font-medium ${pageTheme.muted}`}>
                {card.label}
              </p>
              <div className="mt-6 flex items-end justify-between gap-3">
                <h2 className={`text-3xl font-bold ${card.accent}`}>
                  {card.value}
                </h2>
                <span className={`text-xs ${pageTheme.muted}`}>
                  {card.detail}
                </span>
              </div>
            </article>
          ))}
        </section>

        <section
          className={`overflow-hidden rounded-lg border ${pageTheme.panel}`}
        >
          <div className={`border-b px-4 py-4 sm:px-5 ${pageTheme.divider}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold">All Complaints</h2>
              <p className={`text-sm ${pageTheme.muted}`}>
                {isLoading
                  ? "Loading complaints"
                  : `${firstShownComplaint}-${lastShownComplaint} of ${filteredComplaintCount} shown`}
              </p>
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1040px] border-separate border-spacing-0 text-left text-sm">
              <thead className={pageTheme.tableHead}>
                <tr>
                  <th className="border-b border-inherit px-5 py-4 font-semibold">
                    Name
                  </th>
                  <th className="border-b border-inherit px-5 py-4 font-semibold">
                    Email
                  </th>
                  <th className="border-b border-inherit px-5 py-4 font-semibold">
                    Subject
                  </th>
                  <th className="border-b border-inherit px-5 py-4 font-semibold">
                    Message
                  </th>
                  <th className="border-b border-inherit px-5 py-4 font-semibold">
                    Raised Date
                  </th>
                  <th className="border-b border-inherit px-5 py-4 font-semibold">
                    Status
                  </th>
                  <th className="border-b border-inherit px-5 py-4 font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className={`px-5 py-12 text-center ${pageTheme.muted}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading complaints...
                      </span>
                    </td>
                  </tr>
                ) : filteredComplaintCount === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className={`px-5 py-12 text-center ${pageTheme.muted}`}
                    >
                      {search || hasActiveDateFilter
                        ? "No complaints match your filters."
                        : "No complaints found."}
                    </td>
                  </tr>
                ) : (
                  paginatedComplaints.map((complaint) => (
                    <tr
                      key={complaint?._id || complaint?.email}
                      className={`transition-colors ${pageTheme.tableRow}`}
                    >
                      <td className="border-b border-inherit px-5 py-4 font-medium">
                        {renderHighlightedText(
                          complaint?.customerId?.name || complaint?.name || "-",
                          debouncedSearch,
                          pageTheme.highlight,
                        )}
                      </td>
                      <td className="border-b border-inherit px-5 py-4">
                        {renderHighlightedText(
                          complaint?.customerId?.email ||
                            complaint?.email ||
                            "-",
                          debouncedSearch,
                          pageTheme.highlight,
                        )}
                      </td>
                      <td className="border-b border-inherit px-5 py-4">
                        {renderHighlightedText(
                          complaint?.subject || "-",
                          debouncedSearch,
                          pageTheme.highlight,
                        )}
                      </td>
                      <td className="max-w-sm border-b border-inherit px-5 py-4">
                        <p className="line-clamp-2">
                          {renderHighlightedText(
                            complaint?.message || "-",
                            debouncedSearch,
                            pageTheme.highlight,
                          )}
                        </p>
                      </td>
                      <td className="whitespace-nowrap border-b border-inherit px-5 py-4">
                        {formatDate(
                          complaint?.raisedDate || complaint?.createdAt,
                        )}
                      </td>
                      <td className="border-b border-inherit px-5 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
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
                      <td className="border-b border-inherit px-5 py-4">
                        {renderComplaintActions(complaint)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden">
            {isLoading ? (
              <div
                className={`flex items-center justify-center gap-2 px-4 py-12 text-sm ${pageTheme.muted}`}
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading complaints...
              </div>
            ) : filteredComplaintCount === 0 ? (
              <p
                className={`px-4 py-12 text-center text-sm ${pageTheme.muted}`}
              >
                {search || hasActiveDateFilter
                  ? "No complaints match your filters."
                  : "No complaints found."}
              </p>
            ) : (
              <div className={`divide-y ${pageTheme.divider}`}>
                {paginatedComplaints.map((complaint) => (
                  <article
                    key={complaint?._id || complaint?.email}
                    className="px-4 py-4"
                  >
                    <header className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">
                          {renderHighlightedText(
                            complaint?.subject || "-",
                            debouncedSearch,
                            pageTheme.highlight,
                          )}
                        </h3>
                        <p
                          className={`mt-1 truncate text-xs ${pageTheme.muted}`}
                        >
                          {renderHighlightedText(
                            complaint?.customerId?.name ||
                              complaint?.name ||
                              "-",
                            debouncedSearch,
                            pageTheme.highlight,
                          )}
                        </p>
                      </div>
                      {renderComplaintActions(complaint)}
                    </header>

                    <dl className="mt-4 grid gap-3 text-sm">
                      <div className="min-w-0">
                        <dt
                          className={`text-xs font-medium ${pageTheme.muted}`}
                        >
                          Email
                        </dt>
                        <dd className="mt-1 break-words">
                          {renderHighlightedText(
                            complaint?.customerId?.email ||
                              complaint?.email ||
                              "-",
                            debouncedSearch,
                            pageTheme.highlight,
                          )}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt
                          className={`text-xs font-medium ${pageTheme.muted}`}
                        >
                          Message
                        </dt>
                        <dd className="mt-1 line-clamp-3">
                          {renderHighlightedText(
                            complaint?.message || "-",
                            debouncedSearch,
                            pageTheme.highlight,
                          )}
                        </dd>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <dt
                            className={`text-xs font-medium ${pageTheme.muted}`}
                          >
                            Raised Date
                          </dt>
                          <dd className="mt-1">
                            {formatDate(
                              complaint?.raisedDate || complaint?.createdAt,
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt
                            className={`text-xs font-medium ${pageTheme.muted}`}
                          >
                            Status
                          </dt>
                          <dd className="mt-1">
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
                          </dd>
                        </div>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </div>

          <nav
            className={`flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${pageTheme.divider}`}
            aria-label="Complaint pagination"
          >
            <span className={`text-sm ${pageTheme.muted}`}>
              {PAGE_SIZE} complaints per page
            </span>

            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
              <span className={`text-sm ${pageTheme.muted}`} aria-live="polite">
                Page {activePage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={activePage <= 1 || isLoading}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(Math.min(page, totalPages) - 1, 1),
                    )
                  }
                  className={`inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${pageTheme.button}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="button"
                  disabled={activePage >= totalPages || isLoading}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(page + 1, totalPages))
                  }
                  className={`inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${pageTheme.button}`}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </nav>
        </section>
      </main>
    </DashboardShell>
  );
}
