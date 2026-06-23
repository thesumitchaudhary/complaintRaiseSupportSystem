import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Moon,
  PlusCircle,
  Search,
  Sun,
  MoveUpRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "../../../components/app-sidebar";
import { ComplaintDetailsDialog } from "../../../components/ComplaintDetailsDialog";
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
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Separator } from "../../../components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import { DataTable } from "../../../components/DataTable";
import { RaiseComplaintModal } from "../../../components/RaiseComplaintModal";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import {
  formatDate,
  getComplaintSearchText,
  getRaisedDateFilterLabel,
  getRaisedDateParams,
  raisedDateFilterOptions,
} from "../../../lib/complaints";
import { showloggedinuser } from "../../../services/index";
import { getRaisedComplaint } from "../../../services/user";

const renderHighlightedText = (value, searchTerm) => {
  return <HighlightedText value={value} searchTerm={searchTerm} />;
};

export default function Page() {
  const [theme, setTheme] = useState(false);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, { lowercase: true });
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

  const complaintColumns = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        headerClassName: "border-b border-inherit px-4 py-3 font-semibold",
        cellClassName: "border-b border-inherit px-4 py-3 font-medium",
        render: (ticket) =>
          renderHighlightedText(
            ticket?.name || currentUser?.name || "-",
            debouncedSearch,
          ),
      },
      {
        key: "email",
        header: "Email",
        headerClassName: "border-b border-inherit px-4 py-3 font-semibold",
        cellClassName: "border-b border-inherit px-4 py-3",
        render: (ticket) =>
          renderHighlightedText(
            ticket?.email || currentUser?.email || "-",
            debouncedSearch,
          ),
      },
      {
        key: "subject",
        header: "Subject",
        headerClassName: "border-b border-inherit px-4 py-3 font-semibold",
        cellClassName: "border-b border-inherit px-4 py-3",
        render: (ticket) =>
          renderHighlightedText(ticket?.subject || "-", debouncedSearch),
      },
      {
        key: "message",
        header: "Message",
        headerClassName: "border-b border-inherit px-4 py-3 font-semibold",
        cellClassName: "max-w-sm border-b border-inherit px-4 py-3",
        render: (ticket) => (
          <p className="line-clamp-2">
            {renderHighlightedText(ticket?.message || "-", debouncedSearch)}
          </p>
        ),
      },
      {
        key: "raisedDate",
        header: "Raised Date",
        headerClassName: "border-b border-inherit px-4 py-3 font-semibold",
        cellClassName: "whitespace-nowrap border-b border-inherit px-4 py-3",
        render: (ticket) =>
          renderHighlightedText(
            formatDate(ticket?.raisedDate || ticket?.createdAt),
            debouncedSearch,
          ),
      },
      {
        key: "viewMore",
        header: "View More",
        headerClassName: "border-b border-inherit px-4 py-3 font-semibold",
        cellClassName: "border-b border-inherit px-4 py-3",
        render: (ticket) => (
          <button
            type="button"
            aria-label={`View details for ${ticket?.subject || "complaint"}`}
            onClick={() => setSelectedComplaint(ticket)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${pageTheme.button}`}
          >
            <MoveUpRight className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [currentUser?.email, currentUser?.name, debouncedSearch, pageTheme.button],
  );

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
                          {renderHighlightedText(
                            item?.subject || "Untitled complaint",
                            debouncedSearch,
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
                {filteredComplaints.length > 0 ? (
                  <DataTable
                    columns={complaintColumns}
                    data={filteredComplaints}
                    tableClassName="min-w-[760px] border-separate border-spacing-0 text-left text-sm"
                    headerClassName={pageTheme.tableHead}
                    rowClassName={`transition-colors ${pageTheme.row}`}
                  />
                ) : (
                  <div className={`px-4 py-12 text-center ${pageTheme.muted}`}>
                    {isLoading
                      ? "Loading complaints..."
                      : search
                        ? "No complaints match your search."
                        : "No complaints raised yet."}
                  </div>
                )}
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

      <ComplaintDetailsDialog
        complaint={selectedComplaint}
        currentUser={currentUser}
        isDarkTheme={isDarkTheme}
        onOpenChange={(open) => !open && setSelectedComplaint(null)}
      />
    </div>
  );
}
