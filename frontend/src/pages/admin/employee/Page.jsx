import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { AppSidebar } from "../../../components/admin-app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../components/ui/breadcrumb";
import { toast } from "react-hot-toast";

import { Separator } from "../../../components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import { createEmployee } from "../../../services/employee";
import { showEmployee } from "../../../services/admin";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";

export default function Page() {
  const [theme, setTheme] = useState(false);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const employeeMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      toast.success("Employee created successfully");
      setError("");
      resetForm();
      setEmployeeModalOpen(false);
    },
    onError: (error) => {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create employee",
      );
      toast.error(error.response?.data?.message || "Failed to create employee");
    },
  });

  const toggleTheme = () => {
    setTheme(!theme);
  };

  const handleEmployeeChange = (event) => {
    const { name, value } = event.target;
    setEmployeeForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setEmployeeForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleEmployeeSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!employeeForm.name.trim()) {
      setError("name is required");
      return;
    }

    if (!employeeForm.email.trim()) {
      setError("email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employeeForm.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!employeeForm.password.trim()) {
      setError("password is required");
      return;
    }

    if (!employeeForm.confirmPassword.trim()) {
      setError("confirmedPassword is required");
      return;
    }

    if (employeeForm.password !== employeeForm.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      employeeMutation.mutate(employeeForm);
    } catch (error) {
      setError(error.message || "Failed to create Employee");
    } finally {
      setLoading(false);
    }
  };

  // this is for show all employee
  const { data } = useQuery({
    queryKey: ["showActiveEmployee"],
    queryFn: showEmployee,
  });

  const employeeRows = Array.isArray(data?.result) ? data.result : [];
  const totalEmployees = employeeRows.length;
  const totalAssignedTasks = employeeRows.reduce(
    (total, row) => total + (Array.isArray(row.tasks) ? row.tasks.length : 0),
    0,
  );
  const totalCompletedTasks = employeeRows.reduce((total, row) => {
    const tasks = Array.isArray(row.tasks) ? row.tasks : [];
    return total + tasks.filter((task) => task.status === "completed").length;
  }, 0);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme) {
      root.style.backgroundColor = "#000000";
      body.style.backgroundColor = "#000000";
      body.style.color = "#ffffff";
      root.classList.add("dark");
    } else {
      root.style.backgroundColor = "#ffffff";
      body.style.backgroundColor = "#ffffff";
      body.style.color = "#000000";
      root.classList.remove("dark");
    }
  }, [theme]);

  const pageTheme = theme
    ? {
        shell: "bg-slate-950 text-slate-100",
        panel: "border-slate-800 bg-slate-900/70 text-slate-100",
        muted: "text-slate-400",
        border: "border-slate-800",
        button: "border-slate-700 text-slate-100 hover:bg-slate-800",
        header: "bg-slate-900/90",
        tableRow: "border-slate-800 hover:bg-slate-800/50",
      }
    : {
        shell: "bg-slate-50 text-slate-900",
        panel: "border-slate-200 bg-white text-slate-900",
        muted: "text-slate-500",
        border: "border-slate-200",
        button: "border-slate-300 text-slate-900 hover:bg-slate-100",
        header: "bg-white/90",
        tableRow: "border-slate-200 hover:bg-slate-50",
      };

  return (
    <div className={`${pageTheme.shell} min-h-screen`}>
      <SidebarProvider style={{ backgroundColor: "transparent" }}>
        <AppSidebar />
        <SidebarInset style={{ backgroundColor: "transparent" }}>
          <header
            className={`sticky top-0 z-10 border-b ${pageTheme.border} ${pageTheme.header} backdrop-blur`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
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
                        className={`${pageTheme.muted} transition-colors hover:text-current`}
                        href="#"
                      >
                        Admin dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className={pageTheme.muted}>
                        Employee
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <button
                type="button"
                aria-label="Toggle theme"
                className={`inline-flex h-10 w-10 items-center justify-center rounded-md border transition-colors ${pageTheme.button}`}
                onClick={toggleTheme}
              >
                {theme ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>
            </div>
          </header>
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 lg:p-6">
            <section
              className={`rounded-2xl border ${pageTheme.border} ${pageTheme.panel} p-6 shadow-sm`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                  <p
                    className={`text-sm font-medium uppercase tracking-[0.2em] ${pageTheme.muted}`}
                  >
                    Employee management
                  </p>
                  <h1 className="text-2xl font-semibold md:text-3xl">
                    Employee list
                  </h1>
                  <p
                    className={`max-w-2xl text-sm leading-6 ${pageTheme.muted}`}
                  >
                    Review employee records, track progress, and keep the team
                    roster organized from one place.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEmployeeModalOpen(true)}
                    className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${pageTheme.button}`}
                  >
                    Add employee
                  </button>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <article
                className={`rounded-2xl border ${pageTheme.border} ${pageTheme.panel} p-5 shadow-sm`}
              >
                <p className={`text-sm ${pageTheme.muted}`}>employees</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <h2 className="text-3xl font-semibold">{totalEmployees}</h2>
                </div>
              </article>
              <article
                className={`rounded-2xl border ${pageTheme.border} ${pageTheme.panel} p-5 shadow-sm`}
              >
                <p className={`text-sm ${pageTheme.muted}`}>assigned tasks</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <h2 className="text-3xl font-semibold">
                    {totalAssignedTasks}
                  </h2>
                </div>
              </article>
              <article
                className={`rounded-2xl border ${pageTheme.border} ${pageTheme.panel} p-5 shadow-sm`}
              >
                <p className={`text-sm ${pageTheme.muted}`}>completed tasks</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <h2 className="text-3xl font-semibold">
                    {totalCompletedTasks}
                  </h2>
                </div>
              </article>
            </section>

            <section
              className={`overflow-hidden rounded-2xl border ${pageTheme.border} ${pageTheme.panel} shadow-sm`}
            >
              <div
                className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${pageTheme.border}`}
              >
                <div>
                  <h2 className="text-lg font-semibold">Team roster</h2>
                  <p className={`text-sm ${pageTheme.muted}`}>
                    {/* {Array.isArray(data)
                      ? `${data.length} synced records available`
                      : "Structured view of the current team list"} */}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                  <thead className={pageTheme.header}>
                    <tr>
                      <th
                        className={`border-b px-5 py-3 font-medium ${pageTheme.border}`}
                      >
                        Name
                      </th>
                      <th
                        className={`border-b px-5 py-3 font-medium ${pageTheme.border}`}
                      >
                        Email
                      </th>
                      <th
                        className={`border-b px-5 py-3 font-medium ${pageTheme.border}`}
                      >
                        Join date
                      </th>
                      <th
                        className={`border-b px-5 py-3 font-medium ${pageTheme.border}`}
                      >
                        Pending task
                      </th>
                      <th
                        className={`border-b px-5 py-3 font-medium ${pageTheme.border}`}
                      >
                        Completed task
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeRows.map((row) => {
                      const employee = row.employee || {};
                      const tasks = Array.isArray(row.tasks) ? row.tasks : [];
                      const pendingTasks = tasks.filter(
                        (task) => task.status !== "completed",
                      ).length;
                      const completedTasks = tasks.filter(
                        (task) => task.status === "completed",
                      ).length;

                      return (
                        <tr
                          key={employee._id || employee.email}
                          className={`transition-colors ${pageTheme.tableRow}`}
                        >
                          <td
                            className={`border-b px-5 py-4 ${pageTheme.border}`}
                          >
                            {employee.name || "-"}
                          </td>
                          <td
                            className={`border-b px-5 py-4 ${pageTheme.border}`}
                          >
                            {employee.email || "-"}
                          </td>
                          <td
                            className={`border-b px-5 py-4 ${pageTheme.border}`}
                          >
                            {employee.createdAt
                              ? new Date(employee.createdAt).toLocaleDateString()
                              : "-"}
                          </td>
                          <td
                            className={`border-b px-5 py-4 ${pageTheme.border}`}
                          >
                            {pendingTasks}
                          </td>
                          <td
                            className={`border-b px-5 py-4 ${pageTheme.border}`}
                          >
                            {completedTasks}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Sheet open={employeeModalOpen} onOpenChange={setEmployeeModalOpen}>
        <SheetContent
          side="right"
          className={`w-full sm:max-w-md ${
            theme
              ? "border-slate-700 bg-slate-950 text-slate-100"
              : "border-slate-200 bg-white text-slate-900"
          }`}
        >
          <SheetHeader className="border-b px-6 pb-4 pt-6">
            <SheetTitle className={theme ? "text-slate-100" : "text-slate-900"}>
              Add employee
            </SheetTitle>
            <SheetDescription
              className={theme ? "text-slate-400" : "text-slate-500"}
            >
              Capture the employee details before adding them to the roster.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleEmployeeSubmit}
            className="flex flex-1 flex-col gap-4 px-6 py-6"
          >
            <label className="space-y-2 text-sm font-medium">
              name
              <Input
                name="name"
                value={employeeForm.name}
                onChange={handleEmployeeChange}
                placeholder="Enter employee name"
                className={
                  theme
                    ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500"
                    : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                }
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              Email
              <Input
                name="email"
                type="email"
                value={employeeForm.email}
                onChange={handleEmployeeChange}
                placeholder="employee@company.com"
                className={
                  theme
                    ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500"
                    : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                }
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              Password
              <Input
                name="password"
                type="password"
                value={employeeForm.password}
                onChange={handleEmployeeChange}
                className={
                  theme
                    ? "border-slate-700 bg-slate-900 text-slate-100"
                    : "border-slate-300 bg-white text-slate-900"
                }
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              Confirmed Passowrd
              <Input
                name="confirmPassword"
                type="password"
                value={employeeForm.confirmPassword}
                onChange={handleEmployeeChange}
                className={
                  theme
                    ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500"
                    : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                }
              />
            </label>

            <div className="mt-auto flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEmployeeModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-sky-600 text-white hover:bg-sky-700"
              >
                Save employee
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
