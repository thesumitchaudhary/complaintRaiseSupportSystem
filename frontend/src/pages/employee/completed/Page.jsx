import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarCheck2,
  CheckCircle2,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { EmployeeAppSidebar as AppSidebar } from "../../../components/employee-app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../components/ui/breadcrumb";
import { Separator } from "../../../components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import { showAssignedComplaint } from "../../../services/employee";

const getStatusKey = (status) =>
  String(status || "")
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/_+/g, "_");

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

const getPriorityBadgeClass = (priority, isDarkTheme) => {
  const priorityKey = String(priority || "medium").toLowerCase();
  const priorityClasses = isDarkTheme
    ? {
        low: "bg-emerald-950 text-emerald-200",
        medium: "bg-amber-950 text-amber-200",
        high: "bg-rose-950 text-rose-200",
      }
    : {
        low: "bg-emerald-100 text-emerald-700",
        medium: "bg-amber-100 text-amber-700",
        high: "bg-rose-100 text-rose-700",
      };

  return priorityClasses[priorityKey] || priorityClasses.medium;
};

const getComplaintList = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.assignedComplaints)) {
    return response.assignedComplaints;
  }
  if (Array.isArray(response.result)) return response.result;
  if (Array.isArray(response.data)) return response.data;

  return [];
};

export default function Page() {
  const [theme, setTheme] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
        details: "border-blue-900/60 bg-slate-950/70",
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
        details: "border-[#b8d8ff] bg-[#eef6ff]",
      };

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

  const {
    data: assignedComplaintResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["showAssignedComplaints"],
    queryFn: showAssignedComplaint,
  });

  const completedTasks = useMemo(() => {
    const tasks = getComplaintList(assignedComplaintResponse);

    return tasks
      .filter((task) => getStatusKey(task?.status) === "completed")
      .sort((firstTask, secondTask) => {
        const firstDate = new Date(
          firstTask?.completedDate || firstTask?.updatedAt || 0,
        ).getTime();
        const secondDate = new Date(
          secondTask?.completedDate || secondTask?.updatedAt || 0,
        ).getTime();

        return secondDate - firstDate;
      });
  }, [assignedComplaintResponse]);

  const filteredTasks = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();

    if (!needle) return completedTasks;

    return completedTasks.filter((task) =>
      [
        task?.customerId?.name,
        task?.customerId?.email,
        task?.name,
        task?.email,
        task?.subject,
        task?.task?.title,
        task?.task?.notes,
        task?.resolutionNote,
        task?.priority,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [completedTasks, searchTerm]);

  const highPriorityCount = completedTasks.filter(
    (task) => String(task?.priority).toLowerCase() === "high",
  ).length;
  const withResolutionCount = completedTasks.filter((task) =>
    String(task?.resolutionNote || "").trim(),
  ).length;

  const stats = [
    {
      label: "Completed",
      value: completedTasks.length,
      detail: "Finished tasks",
      icon: CheckCircle2,
      accent: isDarkTheme ? "text-emerald-300" : "text-emerald-600",
    },
    {
      label: "Resolution notes",
      value: withResolutionCount,
      detail: "Documented handoffs",
      icon: BadgeCheck,
      accent: isDarkTheme ? "text-blue-300" : "text-blue-600",
    },
    {
      label: "High priority",
      value: highPriorityCount,
      detail: "Critical work closed",
      icon: CalendarCheck2,
      accent: isDarkTheme ? "text-rose-300" : "text-rose-600",
    },
  ];

  return (
    <div className={`${pageTheme.shell} min-h-screen`}>
      <SidebarProvider style={{ backgroundColor: "transparent" }}>
        <AppSidebar />
        <SidebarInset
          className="min-w-0 w-0 overflow-x-hidden"
          style={{ backgroundColor: "transparent" }}
        >
          <header
            className={`sticky top-0 z-10 flex h-16 shrink-0 items-center border-b ${pageTheme.header}`}
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
                        Employee dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className={`text-sm ${pageTheme.muted}`}>
                        Completed Tasks
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
                <div
                  className={`mb-3 inline-flex items-center gap-2 text-sm font-medium ${pageTheme.muted}`}
                >
                  <BadgeCheck className="h-4 w-4" />
                  Completed work
                </div>
                <h1 className="text-2xl font-bold tracking-normal">
                  Completed Tasks
                </h1>
                <p className={`mt-1 max-w-2xl text-sm ${pageTheme.muted}`}>
                  Review finished tickets and the resolution recorded for each
                  customer.
                </p>
              </div>

              <div className="relative w-full xl:w-[30rem]">
                <Search
                  className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${pageTheme.muted}`}
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search completed tasks or customers"
                  className={`h-12 w-full rounded-none border py-2 pl-12 pr-4 text-sm outline-none transition-colors focus-visible:ring-2 ${pageTheme.field}`}
                />
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <article
                    key={stat.label}
                    className={`min-h-24 rounded-lg border p-4 ${pageTheme.card}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className={`text-sm font-medium ${pageTheme.muted}`}>
                        {stat.label}
                      </p>
                      <Icon className={`h-5 w-5 ${stat.accent}`} />
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-3">
                      <h2 className={`text-2xl font-bold ${stat.accent}`}>
                        {stat.value}
                      </h2>
                      <span className={`text-right text-xs ${pageTheme.muted}`}>
                        {stat.detail}
                      </span>
                    </div>
                  </article>
                );
              })}
            </section>

            <section
              className={`overflow-hidden rounded-lg border ${pageTheme.panel}`}
            >
              <div
                className={`border-b px-4 py-4 sm:px-5 ${pageTheme.divider}`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold">Completion History</h2>
                    <p className={`mt-1 text-sm ${pageTheme.muted}`}>
                      Completed tasks are shown with their final date and
                      resolution.
                    </p>
                  </div>
                  <p className={`text-sm ${pageTheme.muted}`}>
                    {isLoading
                      ? "Loading tasks"
                      : `${filteredTasks.length} of ${completedTasks.length} shown`}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] border-separate border-spacing-0 text-left text-sm">
                  <thead className={pageTheme.tableHead}>
                    <tr>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Customer
                      </th>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Task
                      </th>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Priority
                      </th>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Completed
                      </th>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Resolution
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className={`px-5 py-12 text-center ${pageTheme.muted}`}
                        >
                          Loading completed tasks...
                        </td>
                      </tr>
                    ) : isError ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-12 text-center text-rose-600"
                        >
                          Failed to load completed tasks.
                        </td>
                      </tr>
                    ) : filteredTasks.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className={`px-5 py-12 text-center ${pageTheme.muted}`}
                        >
                          {searchTerm
                            ? "No completed tasks match your search."
                            : "No completed tasks found."}
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((task, index) => {
                        const customerName =
                          task?.customerId?.name ||
                          task?.name ||
                          "Unknown customer";
                        const customerEmail =
                          task?.customerId?.email || task?.email || "-";
                        const title =
                          task?.task?.title || task?.subject || "Untitled task";
                        const priority = task?.priority || "medium";
                        const resolution =
                          task?.resolutionNote ||
                          task?.workUpdates
                            ?.slice()
                            .reverse()
                            .find(
                              (update) =>
                                getStatusKey(update?.status) === "completed",
                            )?.message ||
                          "No resolution note provided.";

                        return (
                          <tr
                            key={
                              task?._id || `${customerEmail}-${title}-${index}`
                            }
                            className={`transition-colors ${pageTheme.tableRow}`}
                          >
                            <td className="border-b border-inherit px-5 py-4">
                              <p className="font-medium">{customerName}</p>
                              <p className={`mt-1 text-xs ${pageTheme.muted}`}>
                                {customerEmail}
                              </p>
                            </td>
                            <td className="max-w-sm border-b border-inherit px-5 py-4">
                              <p className="font-medium">{title}</p>
                              <p
                                className={`mt-1 line-clamp-2 text-xs leading-5 ${pageTheme.muted}`}
                              >
                                {task?.task?.notes ||
                                  task?.message ||
                                  "No task notes provided."}
                              </p>
                            </td>
                            <td className="border-b border-inherit px-5 py-4">
                              <span
                                className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold capitalize ${getPriorityBadgeClass(
                                  priority,
                                  isDarkTheme,
                                )}`}
                              >
                                {priority}
                              </span>
                            </td>
                            <td className="whitespace-nowrap border-b border-inherit px-5 py-4">
                              <span className="inline-flex items-center gap-2">
                                <CalendarCheck2
                                  className={`h-4 w-4 ${pageTheme.muted}`}
                                />
                                {formatDate(
                                  task?.completedDate || task?.updatedAt,
                                )}
                              </span>
                            </td>
                            <td className="max-w-sm border-b border-inherit px-5 py-4">
                              <p
                                className={`line-clamp-3 text-xs leading-5 ${pageTheme.muted}`}
                              >
                                {resolution}
                              </p>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {!isLoading && !isError && completedTasks.length > 0 ? (
                <div
                  className={`flex items-center gap-2 border-t px-5 py-3 text-xs ${pageTheme.divider} ${pageTheme.muted}`}
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Only tasks marked as completed are included.
                </div>
              ) : null}
            </section>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
