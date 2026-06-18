import { useEffect, useState } from "react";
import { Moon, Search, Sun } from "lucide-react";
import { toast } from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "../../../components/ui/input";
import { Separator } from "../../../components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import { showEmployee } from "../../../services/admin";
import { createEmployee } from "../../../services/employee";

const initialEmployeeForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
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

export default function Page() {
  const [theme, setTheme] = useState(false);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [employeeForm, setEmployeeForm] = useState(initialEmployeeForm);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const isDarkTheme = theme;
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

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
        error: "border-red-900/70 bg-red-950/50 text-red-200",
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
        error: "border-red-200 bg-red-50 text-red-700",
      };

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

  const resetForm = () => {
    setEmployeeForm(initialEmployeeForm);
    setError("");
  };

  const employeeMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["showActiveEmployee"],
      });
      toast.success("Employee created successfully");
      resetForm();
      setEmployeeModalOpen(false);
    },
    onError: (mutationError) => {
      const message =
        mutationError.response?.data?.message ||
        mutationError.message ||
        "Failed to create employee";

      setError(message);
      toast.error(message);
    },
  });

  const handleEmployeeChange = (event) => {
    const { name, value } = event.target;

    setEmployeeForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleEmployeeSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!employeeForm.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!employeeForm.email.trim()) {
      setError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(employeeForm.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!employeeForm.password.trim()) {
      setError("Password is required");
      return;
    }

    if (!employeeForm.confirmPassword.trim()) {
      setError("Confirm password is required");
      return;
    }

    if (employeeForm.password !== employeeForm.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    employeeMutation.mutate(employeeForm);
  };

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
                        Admin dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className={`text-sm ${pageTheme.muted}`}>
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

          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 lg:p-6">
            <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-normal">
                  Employee Management
                </h1>
                <p className={`mt-1 max-w-2xl text-sm ${pageTheme.muted}`}>
                  Review employee records, track task progress, and keep the
                  team roster organized from one place.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
                <div className="relative w-full xl:w-[26rem]">
                  <Search
                    className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${pageTheme.muted}`}
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search employees"
                    className={`h-12 w-full rounded-none border py-2 pl-12 pr-4 text-sm outline-none transition-colors focus-visible:ring-2 ${pageTheme.field}`}
                  />

                  {suggestions.length > 0 ? (
                    <div
                      className={`absolute left-0 top-full z-50 mt-1 w-full overflow-hidden border shadow-lg ${pageTheme.panel}`}
                    >
                      {suggestions.map((row) => {
                        const employee = row?.employee || {};

                        return (
                          <button
                            key={employee?._id || employee?.email}
                            type="button"
                            className={`block w-full px-4 py-3 text-left text-sm transition-colors ${pageTheme.suggestionHover}`}
                            onClick={() => setSearch(employee?.name || "")}
                          >
                            <span className="font-medium">
                              {employee?.name || "-"}
                            </span>
                            <span className={`ml-2 ${pageTheme.muted}`}>
                              {employee?.email || ""}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                <Button
                  type="button"
                  className="h-12 rounded-none bg-blue-600 px-5 text-white hover:bg-blue-700"
                  onClick={() => setEmployeeModalOpen(true)}
                >
                  Add Employee
                </Button>
              </div>
            </section>

            <section className="grid gap-3 md:grid-cols-3">
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className={`min-h-24 rounded-lg border p-4 ${pageTheme.card}`}
                >
                  <p className={`text-sm font-medium ${pageTheme.muted}`}>
                    {stat.label}
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <h2 className={`text-2xl font-bold ${stat.accent}`}>
                      {stat.value}
                    </h2>
                    <span className={`text-right text-xs ${pageTheme.muted}`}>
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
                  <div>
                    <h2 className="text-lg font-bold">Team Roster</h2>
                    <p className={`mt-1 text-sm ${pageTheme.muted}`}>
                      View employee details and their current task workload.
                    </p>
                  </div>
                  <p className={`text-sm ${pageTheme.muted}`}>
                    {isEmployeesLoading
                      ? "Loading employees"
                      : `${filteredEmployees.length} of ${employeeRows.length} shown`}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left text-sm">
                  <thead className={pageTheme.tableHead}>
                    <tr>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Name
                      </th>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Email
                      </th>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Join Date
                      </th>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Pending Tasks
                      </th>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Completed Tasks
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {isEmployeesLoading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className={`px-5 py-12 text-center ${pageTheme.muted}`}
                        >
                          Loading employees...
                        </td>
                      </tr>
                    ) : filteredEmployees.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className={`px-5 py-12 text-center ${pageTheme.muted}`}
                        >
                          {search
                            ? "No employees match your search."
                            : "No employees found."}
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((row) => {
                        const employee = row?.employee || {};
                        const tasks = Array.isArray(row?.tasks)
                          ? row.tasks
                          : [];
                        const pendingTasks = tasks.filter(
                          (task) => task?.status !== "completed",
                        ).length;
                        const completedTasks = tasks.filter(
                          (task) => task?.status === "completed",
                        ).length;

                        return (
                          <tr
                            key={employee?._id || employee?.email}
                            className={`transition-colors ${pageTheme.tableRow}`}
                          >
                            <td className="border-b border-inherit px-5 py-4 font-medium">
                              {employee?.name || "-"}
                            </td>
                            <td className="border-b border-inherit px-5 py-4">
                              {employee?.email || "-"}
                            </td>
                            <td className="whitespace-nowrap border-b border-inherit px-5 py-4">
                              {formatDate(employee?.createdAt)}
                            </td>
                            <td className="border-b border-inherit px-5 py-4">
                              <span
                                className={`inline-flex min-w-8 justify-center rounded-md px-2 py-1 text-xs font-semibold ${
                                  pendingTasks > 0
                                    ? isDarkTheme
                                      ? "bg-amber-950 text-amber-200"
                                      : "bg-amber-100 text-amber-700"
                                    : isDarkTheme
                                      ? "bg-slate-800 text-slate-300"
                                      : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {pendingTasks}
                              </span>
                            </td>
                            <td className="border-b border-inherit px-5 py-4">
                              <span
                                className={`inline-flex min-w-8 justify-center rounded-md px-2 py-1 text-xs font-semibold ${
                                  isDarkTheme
                                    ? "bg-emerald-950 text-emerald-200"
                                    : "bg-emerald-100 text-emerald-700"
                                }`}
                              >
                                {completedTasks}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </SidebarInset>
      </SidebarProvider>

      <Sheet
        open={employeeModalOpen}
        onOpenChange={(open) => {
          setEmployeeModalOpen(open);

          if (!open && !employeeMutation.isPending) {
            resetForm();
          }
        }}
      >
        <SheetContent
          side="right"
          className={`${pageTheme.panel} flex h-screen w-full flex-col overflow-hidden p-0 sm:max-w-md`}
        >
          <SheetHeader
            className={`border-b px-6 pb-5 pt-7 text-left ${pageTheme.divider}`}
          >
            <SheetTitle
              className={isDarkTheme ? "text-slate-100" : "text-[#001a3a]"}
            >
              Add Employee
            </SheetTitle>
            <SheetDescription className={pageTheme.muted}>
              Capture the employee details before adding them to the roster.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleEmployeeSubmit}
            className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-6"
          >
            {error ? (
              <p
                className={`rounded-md border px-3 py-2 text-sm ${pageTheme.error}`}
              >
                {error}
              </p>
            ) : null}

            <label className="space-y-2 text-sm font-semibold">
              Name
              <Input
                name="name"
                value={employeeForm.name}
                onChange={handleEmployeeChange}
                placeholder="Enter employee name"
                className={`h-11 ${pageTheme.field}`}
              />
            </label>

            <label className="space-y-2 text-sm font-semibold">
              Email
              <Input
                name="email"
                type="email"
                value={employeeForm.email}
                onChange={handleEmployeeChange}
                placeholder="employee@company.com"
                className={`h-11 ${pageTheme.field}`}
              />
            </label>

            <label className="space-y-2 text-sm font-semibold">
              Password
              <Input
                name="password"
                type="password"
                value={employeeForm.password}
                onChange={handleEmployeeChange}
                placeholder="Enter password"
                className={`h-11 ${pageTheme.field}`}
              />
            </label>

            <label className="space-y-2 text-sm font-semibold">
              Confirm Password
              <Input
                name="confirmPassword"
                type="password"
                value={employeeForm.confirmPassword}
                onChange={handleEmployeeChange}
                placeholder="Confirm password"
                className={`h-11 ${pageTheme.field}`}
              />
            </label>

            <div
              className={`mt-auto flex gap-3 border-t pt-5 ${pageTheme.divider}`}
            >
              <Button
                type="button"
                variant="outline"
                disabled={employeeMutation.isPending}
                onClick={() => {
                  resetForm();
                  setEmployeeModalOpen(false);
                }}
                className={`h-11 flex-1 rounded-none ${pageTheme.button}`}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={employeeMutation.isPending}
                className="h-11 flex-1 rounded-none bg-blue-600 text-white hover:bg-blue-700"
              >
                {employeeMutation.isPending ? "Saving..." : "Save Employee"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
