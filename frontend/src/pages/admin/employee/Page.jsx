import { useMemo, useState } from "react";
import { Moon, Search, Sun } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AddEmployeeModal } from "../../../components/AddEmployeeModal";
import { AppSidebar } from "../../../components/admin-app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../components/ui/breadcrumb";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import { DataTable } from "../../../components/DataTable";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useDocumentTheme } from "../../../hooks/useDocumentTheme";
import { formatDate } from "../../../lib/complaints";
import { showEmployee } from "../../../services/admin";

const getTaskCounts = (row) => {
  const tasks = Array.isArray(row?.tasks) ? row.tasks : [];

  return {
    pending: tasks.filter((task) => task?.status !== "completed").length,
    completed: tasks.filter((task) => task?.status === "completed").length,
  };
};

export default function Page() {
  const [theme, setTheme] = useState(false);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const isDarkTheme = theme;

  useDocumentTheme(isDarkTheme);

  const { data, isLoading: isEmployeesLoading } = useQuery({
    queryKey: ["showActiveEmployee", debouncedSearch],
    queryFn: () => showEmployee(debouncedSearch),
  });

  const employeeRows = Array.isArray(data?.result) ? data.result : [];

  const filteredEmployees = employeeRows.filter((row) =>
    (row?.employee?.name || "")
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase()),
  );

  const suggestions = search.trim()
    ? employeeRows
        .filter((row) =>
          (row?.employee?.name || "")
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .slice(0, 5)
    : [];

  const totalEmployees = employeeRows.length;
  const totalAssignedTasks = employeeRows.reduce(
    (total, row) => total + (Array.isArray(row?.tasks) ? row.tasks.length : 0),
    0,
  );
  const totalCompletedTasks = employeeRows.reduce((total, row) => {
    const tasks = Array.isArray(row?.tasks) ? row.tasks : [];

    return total + tasks.filter((task) => task?.status === "completed").length;
  }, 0);

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
      };

  const employeeColumns = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        cellClassName: "font-medium",
        render: (row) => row?.employee?.name || "-",
      },
      {
        key: "email",
        header: "Email",
        render: (row) => row?.employee?.email || "-",
      },
      {
        key: "joinDate",
        header: "Join Date",
        cellClassName: "whitespace-nowrap",
        render: (row) => formatDate(row?.employee?.createdAt),
      },
      {
        key: "pendingTasks",
        header: "Pending Tasks",
        render: (row) => {
          const { pending } = getTaskCounts(row);

          return (
            <span
              className={`inline-flex min-w-8 justify-center rounded-md px-2 py-1 text-xs font-semibold ${
                pending > 0
                  ? isDarkTheme
                    ? "bg-amber-950 text-amber-200"
                    : "bg-amber-100 text-amber-700"
                  : isDarkTheme
                    ? "bg-slate-800 text-slate-300"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {pending}
            </span>
          );
        },
      },
      {
        key: "completedTasks",
        header: "Completed Tasks",
        render: (row) => {
          const { completed } = getTaskCounts(row);

          return (
            <span
              className={`inline-flex min-w-8 justify-center rounded-md px-2 py-1 text-xs font-semibold ${
                isDarkTheme
                  ? "bg-emerald-950 text-emerald-200"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {completed}
            </span>
          );
        },
      },
    ],
    [isDarkTheme],
  );

  const stats = [
    {
      label: "Total Employees",
      value: totalEmployees,
      detail: "Active team members",
      accent: isDarkTheme ? "text-blue-300" : "text-blue-600",
    },
    {
      label: "Assigned Tasks",
      value: totalAssignedTasks,
      detail: "Tasks currently allocated",
      accent: isDarkTheme ? "text-violet-300" : "text-blue-600",
    },
    {
      label: "Completed Tasks",
      value: totalCompletedTasks,
      detail: "Successfully finished",
      accent: isDarkTheme ? "text-emerald-300" : "text-emerald-600",
    },
  ];

  return (
    <div className={`${pageTheme.shell} min-h-screen`}>
      <SidebarProvider style={{ backgroundColor: "transparent" }}>
        <AppSidebar />
        <SidebarInset
          className="w-0 min-w-0 overflow-x-hidden"
          style={{ backgroundColor: "transparent" }}
        >
          <header
            className={`sticky top-0 z-10 flex h-16 shrink-0 items-center border-b ${pageTheme.header}`}
          >
            <div className="flex w-full min-w-0 items-center justify-between gap-3 px-3 sm:px-4">
              <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb className="min-w-0">
                  <BreadcrumbList className="flex-nowrap">
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink
                        className={`text-sm ${pageTheme.muted}`}
                        href="#"
                      >
                        Admin dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem className="min-w-0">
                      <BreadcrumbPage
                        className={`truncate text-sm ${pageTheme.muted}`}
                      >
                        Employees
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

          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 p-3 sm:gap-6 sm:p-4 lg:p-6">
            <section
              aria-labelledby="employee-management-title"
              className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"
            >
              <div>
                <h1
                  id="employee-management-title"
                  className="text-xl font-bold tracking-normal sm:text-2xl"
                >
                  Employee Management
                </h1>
                <p className={`mt-1 max-w-2xl text-sm ${pageTheme.muted}`}>
                  Review employee records, track task progress, and keep the
                  team roster organized from one place.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
                <form
                  role="search"
                  aria-label="Search employees"
                  className="relative w-full xl:w-[26rem]"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <label htmlFor="employee-search" className="sr-only">
                    Search employees
                  </label>
                  <Search
                    className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${pageTheme.muted}`}
                    aria-hidden="true"
                  />
                  <input
                    id="employee-search"
                    type="search"
                    role="combobox"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search employees"
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-controls={
                      suggestions.length > 0
                        ? "employee-search-suggestions"
                        : undefined
                    }
                    aria-expanded={suggestions.length > 0}
                    className={`h-11 w-full rounded-none border py-2 pl-12 pr-4 text-sm outline-none transition-colors focus-visible:ring-2 sm:h-12 ${pageTheme.field}`}
                  />

                  {suggestions.length > 0 ? (
                    <ul
                      id="employee-search-suggestions"
                      aria-label="Employee suggestions"
                      className={`absolute left-0 top-full z-50 mt-1 w-full overflow-hidden border shadow-lg ${pageTheme.panel}`}
                    >
                      {suggestions.map((row) => {
                        const employee = row?.employee || {};

                        return (
                          <li key={employee?._id || employee?.email}>
                            <button
                              type="button"
                              className={`flex w-full min-w-0 flex-col px-4 py-3 text-left text-sm transition-colors sm:block ${pageTheme.suggestionHover}`}
                              onClick={() => setSearch(employee?.name || "")}
                            >
                              <span className="truncate font-medium">
                                {employee?.name || "-"}
                              </span>
                              <span
                                className={`truncate sm:ml-2 ${pageTheme.muted}`}
                              >
                                {employee?.email || ""}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </form>

                <Button
                  type="button"
                  className="h-11 w-full rounded-none bg-blue-600 px-5 text-white hover:bg-blue-700 sm:h-12 sm:w-auto"
                  onClick={() => setEmployeeModalOpen(true)}
                >
                  Add Employee
                </Button>
              </div>
            </section>

            <section
              aria-labelledby="employee-summary-title"
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
            >
              <h2 id="employee-summary-title" className="sr-only">
                Employee summary
              </h2>
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  aria-label={`${stat.label}: ${stat.value}`}
                  className={`min-h-24 rounded-lg border p-4 sm:last:col-span-2 xl:last:col-span-1 ${pageTheme.card}`}
                >
                  <p className={`text-sm font-medium ${pageTheme.muted}`}>
                    {stat.label}
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <p className={`text-2xl font-bold ${stat.accent}`}>
                      {stat.value}
                    </p>
                    <span className={`text-right text-xs ${pageTheme.muted}`}>
                      {stat.detail}
                    </span>
                  </div>
                </article>
              ))}
            </section>

            <section
              aria-labelledby="team-roster-title"
              className={`overflow-hidden rounded-lg border ${pageTheme.panel}`}
            >
              <header
                className={`border-b px-4 py-4 sm:px-5 ${pageTheme.divider}`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 id="team-roster-title" className="text-lg font-bold">
                      Team Roster
                    </h2>
                    <p className={`mt-1 text-sm ${pageTheme.muted}`}>
                      View employee details and their current task workload.
                    </p>
                  </div>
                  <p
                    className={`text-sm ${pageTheme.muted}`}
                    aria-live="polite"
                  >
                    {isEmployeesLoading
                      ? "Loading employees"
                      : `${filteredEmployees.length} of ${employeeRows.length} shown`}
                  </p>
                </div>
              </header>

              <div className="lg:hidden">
                {isEmployeesLoading || filteredEmployees.length === 0 ? (
                  <p
                    className={`px-4 py-12 text-center ${pageTheme.muted}`}
                    role="status"
                  >
                    {isEmployeesLoading
                      ? "Loading employees..."
                      : search
                        ? "No employees match your search."
                        : "No employees found."}
                  </p>
                ) : (
                  <ul aria-label="Employees" className="divide-y">
                    {filteredEmployees.map((row, index) => {
                      const employee = row?.employee || {};
                      const { pending, completed } = getTaskCounts(row);

                      return (
                        <li
                          key={employee?._id || employee?.email || index}
                          className={pageTheme.divider}
                        >
                          <article className="space-y-4 p-4">
                            <header className="min-w-0">
                              <h3 className="truncate font-semibold">
                                {employee?.name || "-"}
                              </h3>
                              {employee?.email ? (
                                <a
                                  href={`mailto:${employee.email}`}
                                  className={`block break-all text-sm ${pageTheme.muted}`}
                                >
                                  {employee.email}
                                </a>
                              ) : (
                                <p
                                  className={`break-all text-sm ${pageTheme.muted}`}
                                >
                                  -
                                </p>
                              )}
                            </header>

                            <dl className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <dt className={pageTheme.muted}>Join date</dt>
                                <dd className="mt-1 font-medium">
                                  {formatDate(employee?.createdAt)}
                                </dd>
                              </div>
                              <div>
                                <dt className={pageTheme.muted}>Tasks</dt>
                                <dd className="mt-1 flex flex-wrap gap-2">
                                  <span
                                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${
                                      pending > 0
                                        ? isDarkTheme
                                          ? "bg-amber-950 text-amber-200"
                                          : "bg-amber-100 text-amber-700"
                                        : isDarkTheme
                                          ? "bg-slate-800 text-slate-300"
                                          : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {pending} pending
                                  </span>
                                  <span
                                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${
                                      isDarkTheme
                                        ? "bg-emerald-950 text-emerald-200"
                                        : "bg-emerald-100 text-emerald-700"
                                    }`}
                                  >
                                    {completed} completed
                                  </span>
                                </dd>
                              </div>
                            </dl>
                          </article>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div
                aria-label="Employee table"
                role="region"
                tabIndex={0}
                className="hidden overflow-x-auto lg:block"
              >
                <DataTable
                  columns={employeeColumns}
                  data={filteredEmployees}
                  getRowKey={(row, index) =>
                    row?.employee?._id || row?.employee?.email || index
                  }
                  isLoading={isEmployeesLoading}
                  loadingMessage="Loading employees..."
                  emptyMessage={
                    search
                      ? "No employees match your search."
                      : "No employees found."
                  }
                  tableClassName="min-w-[900px] border-separate border-spacing-0 text-left text-sm"
                  headerClassName={pageTheme.tableHead}
                  headerCellClassName="border-b border-inherit px-5 py-4 font-semibold"
                  rowClassName={`transition-colors ${pageTheme.tableRow}`}
                  cellClassName="border-b border-inherit px-5 py-4"
                  emptyClassName={`px-5 py-12 ${pageTheme.muted}`}
                />
              </div>
            </section>
          </main>
        </SidebarInset>
      </SidebarProvider>

      <AddEmployeeModal
        open={employeeModalOpen}
        onOpenChange={setEmployeeModalOpen}
        theme={isDarkTheme}
      />
    </div>
  );
}
