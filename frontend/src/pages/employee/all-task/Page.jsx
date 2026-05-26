import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  LoaderCircle,
  Moon,
  Search,
  ShieldAlert,
  Sun,
  UserRound,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { EmployeeAppSidebar as AppSidebar } from "../../../components/employee-app-sidebar";
import { Button } from "../../../components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../components/ui/breadcrumb";
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
import { showComplain } from "../../../services/admin";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function Page() {
  const [theme, setTheme] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);

  const toggleTheme = () => {
    setTheme((currentTheme) => !currentTheme);
  };

  const pageTheme = theme
    ? {
        shell: "bg-slate-950 text-slate-100",
        panel: "border-slate-800 bg-slate-900/70 text-slate-100",
        muted: "text-slate-400",
        border: "border-slate-800",
        header: "bg-slate-900/90",
        tableHead: "bg-slate-900 text-slate-200",
        tableRow: "border-slate-800 hover:bg-slate-800/40",
        button: "border-slate-700 text-slate-100 hover:bg-slate-800",
        field:
          "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-sky-500",
        heroCard: "border-slate-800 bg-slate-900/60",
      }
    : {
        shell: "bg-slate-50 text-slate-900",
        panel: "border-slate-200 bg-white text-slate-900",
        muted: "text-slate-500",
        border: "border-slate-200",
        header: "bg-white/90",
        tableHead: "bg-slate-100 text-slate-700",
        tableRow: "border-slate-200 hover:bg-slate-50",
        button: "border-slate-300 text-slate-900 hover:bg-slate-100",
        field:
          "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-sky-500",
        heroCard: "border-slate-200 bg-sky-50/70",
      };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme);
  }, [theme]);

  const { data: complaintData, isLoading } = useQuery({
    queryKey: ["employeeAllTasks"],
    queryFn: showComplain,
  });

  const allComplaints = Array.isArray(complaintData?.result)
    ? complaintData.result
    : [];

  const tasks = useMemo(() => {
    return allComplaints.filter((complaint) => {
      const status = String(complaint?.status || "").toLowerCase();
      return ["assigned", "in_progress", "completed", "overdue"].includes(status);
    });
  }, [allComplaints]);

  const filteredTasks = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();

    if (!needle) {
      return tasks;
    }

    return tasks.filter((task) => {
      const customerName = String(task?.customerId?.name || "").toLowerCase();
      const customerEmail = String(task?.customerId?.email || "").toLowerCase();
      const subject = String(task?.subject || "").toLowerCase();
      const taskTitle = String(task?.task?.title || "").toLowerCase();

      return (
        customerName.includes(needle) ||
        customerEmail.includes(needle) ||
        subject.includes(needle) ||
        taskTitle.includes(needle)
      );
    });
  }, [searchTerm, tasks]);

  const stats = [
    {
      label: "All tasks",
      value: tasks.length,
      detail: "Assigned work items",
      icon: BadgeCheck,
      accent: theme ? "text-sky-400" : "text-sky-600",
    },
    {
      label: "In progress",
      value: tasks.filter((task) => String(task?.status || "").toLowerCase() === "in_progress").length,
      detail: "Currently active",
      icon: LoaderCircle,
      accent: theme ? "text-amber-400" : "text-amber-600",
    },
    {
      label: "Due dates",
      value: tasks.filter((task) => Boolean(task?.deadline)).length,
      detail: "Tasks with deadlines",
      icon: CalendarDays,
      accent: theme ? "text-emerald-400" : "text-emerald-600",
    },
  ];

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return dateFormatter.format(date);
  };

  const getStatusBadgeClass = (status) => {
    const normalizedStatus = String(status || "pending").toLowerCase();

    if (normalizedStatus === "completed") {
      return theme
        ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
        : "bg-emerald-100 text-emerald-700";
    }

    if (normalizedStatus === "in_progress") {
      return theme
        ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30"
        : "bg-amber-100 text-amber-700";
    }

    if (normalizedStatus === "overdue") {
      return theme
        ? "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30"
        : "bg-rose-100 text-rose-700";
    }

    return theme
      ? "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30"
      : "bg-sky-100 text-sky-700";
  };

  return (
    <div className={`${pageTheme.shell} min-h-screen`}>
      <SidebarProvider style={{ backgroundColor: "transparent" }}>
        <AppSidebar />
        <SidebarInset
          className={pageTheme.shell}
          style={{ backgroundColor: "transparent" }}
        >
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
                        Employee dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className={pageTheme.muted}>
                        All Task
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
            <section className={`rounded-3xl border ${pageTheme.border} ${pageTheme.panel} overflow-hidden shadow-sm`}>
              <div className="grid gap-6 p-6 xl:grid-cols-[1.25fr_0.75fr] xl:p-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Employee workbench
                  </div>
                  <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                    Track every assigned task from one focused workspace.
                  </h1>
                  <p className={`max-w-2xl text-sm leading-7 sm:text-base ${pageTheme.muted}`}>
                    Search the queue, inspect customer context, and monitor progress
                    without jumping between screens.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  {stats.map((item) => {
                    const Icon = item.icon;

                    return (
                      <article
                        key={item.label}
                        className={`rounded-2xl border p-4 shadow-sm ${pageTheme.heroCard}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className={`text-sm ${pageTheme.muted}`}>{item.label}</p>
                            <h2 className={`mt-2 text-3xl font-semibold ${item.accent}`}>
                              {item.value}
                            </h2>
                            <p className={`mt-2 text-sm ${pageTheme.muted}`}>{item.detail}</p>
                          </div>
                          <div className="rounded-2xl border border-white/40 bg-white p-3 shadow-sm">
                            <Icon className={`h-5 w-5 ${item.accent}`} />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className={`rounded-3xl border ${pageTheme.border} ${pageTheme.panel} overflow-hidden shadow-sm`}>
              <div className="flex flex-col gap-4 border-b border-inherit p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">All tasks</h2>
                  <p className={`mt-1 text-sm ${pageTheme.muted}`}>
                    {isLoading
                      ? "Loading assigned work..."
                      : `${filteredTasks.length} task${filteredTasks.length === 1 ? "" : "s"} in the queue`}
                  </p>
                </div>

                <div className="relative w-full md:max-w-md">
                  <Search className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${pageTheme.muted}`} />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search customer, subject, or task"
                    className={`pl-9 ${pageTheme.field}`}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left">
                  <thead className={pageTheme.tableHead}>
                    <tr>
                      <th className="px-6 py-4 text-sm font-medium">Customer</th>
                      <th className="px-6 py-4 text-sm font-medium">Task</th>
                      <th className="px-6 py-4 text-sm font-medium">Status</th>
                      <th className="px-6 py-4 text-sm font-medium">Priority</th>
                      <th className="px-6 py-4 text-sm font-medium">Due date</th>
                      <th className="px-6 py-4 text-sm font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="mx-auto max-w-sm space-y-2">
                            <p className="text-lg font-semibold">No tasks found</p>
                            <p className={`text-sm ${pageTheme.muted}`}>
                              Try clearing the search or check back once tasks are assigned.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((task) => {
                        const customerName = task?.customerId?.name || task?.name || "Unknown customer";
                        const customerEmail = task?.customerId?.email || task?.email || "-";
                        const title = task?.task?.title || task?.subject || "Untitled task";
                        const status = task?.status || "pending";

                        return (
                          <tr key={task?._id} className={`border-t ${pageTheme.tableRow}`}>
                            <td className="px-6 py-5 align-top">
                              <div className="space-y-1">
                                <p className="font-semibold">{customerName}</p>
                                <p className={`text-sm ${pageTheme.muted}`}>{customerEmail}</p>
                              </div>
                            </td>
                            <td className="px-6 py-5 align-top">
                              <p className="max-w-xs font-medium leading-6">{title}</p>
                              <p className={`mt-1 text-sm ${pageTheme.muted} line-clamp-2`}>
                                {task?.task?.notes || task?.message || "No additional notes provided."}
                              </p>
                            </td>
                            <td className="px-6 py-5 align-top">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(status)}`}>
                                {String(status).replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="px-6 py-5 align-top">
                              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                                {task?.priority || "medium"}
                              </span>
                            </td>
                            <td className="px-6 py-5 align-top">
                              <div className={`flex items-center gap-2 text-sm ${pageTheme.muted}`}>
                                <Clock3 className="h-4 w-4" />
                                {formatDate(task?.deadline || task?.acceptedDate || task?.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-5 align-top">
                              <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => setSelectedTask(task)}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </SidebarInset>
      </SidebarProvider>

      <Sheet open={Boolean(selectedTask)} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <SheetContent className={`${pageTheme.panel} ${pageTheme.border} overflow-y-auto`}>
          <SheetHeader>
            <SheetTitle>Task details</SheetTitle>
            <SheetDescription className={pageTheme.muted}>
              Review the customer, task, and status information for the selected item.
            </SheetDescription>
          </SheetHeader>

          {selectedTask ? (
            <div className="mt-6 space-y-5">
              <div>
                <p className={`text-sm ${pageTheme.muted}`}>Customer</p>
                <p className="mt-1 font-medium">{selectedTask?.customerId?.name || selectedTask?.name || "Unknown customer"}</p>
                <p className={`text-sm ${pageTheme.muted}`}>{selectedTask?.customerId?.email || selectedTask?.email || "-"}</p>
              </div>

              <div>
                <p className={`text-sm ${pageTheme.muted}`}>Task</p>
                <p className="mt-1 font-medium">{selectedTask?.task?.title || selectedTask?.subject || "Untitled task"}</p>
                <p className={`mt-2 text-sm leading-6 ${pageTheme.muted}`}>
                  {selectedTask?.task?.notes || selectedTask?.message || "No task notes available."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border p-4">
                  <p className={`text-sm ${pageTheme.muted}`}>Status</p>
                  <p className="mt-1 font-medium capitalize">
                    {String(selectedTask?.status || "pending").replace(/_/g, " ")}
                  </p>
                </div>
                <div className="rounded-2xl border p-4">
                  <p className={`text-sm ${pageTheme.muted}`}>Priority</p>
                  <p className="mt-1 font-medium capitalize">{selectedTask?.priority || "medium"}</p>
                </div>
                <div className="rounded-2xl border p-4">
                  <p className={`text-sm ${pageTheme.muted}`}>Due date</p>
                  <p className="mt-1 font-medium">{formatDate(selectedTask?.deadline)}</p>
                </div>
                <div className="rounded-2xl border p-4">
                  <p className={`text-sm ${pageTheme.muted}`}>Service type</p>
                  <p className="mt-1 font-medium">{selectedTask?.serviceType || "-"}</p>
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
