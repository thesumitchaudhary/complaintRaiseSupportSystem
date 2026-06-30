import { useMemo, useState } from "react";
import { Clock3, Loader2, Moon, Search, Send, Sun } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
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
import { Textarea } from "../../../components/ui/textarea";
import { useDocumentTheme } from "../../../hooks/useDocumentTheme";
import {
  formatDate,
  formatStatusLabel,
  getStatusBadgeClass,
  getStatusKey,
} from "../../../lib/complaints";
import { showAssignedComplaint, workUpdate } from "../../../services/employee";

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

const initialWorkUpdateForm = {
  status: "in_progress",
  message: "",
};

export default function Page() {
  const [theme, setTheme] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [workUpdateForm, setWorkUpdateForm] = useState(initialWorkUpdateForm);
  const [formError, setFormError] = useState("");

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

  useDocumentTheme(isDarkTheme);

  const workUpdateMutation = useMutation({
    mutationFn: workUpdate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["showAssignedComplaints"],
      });
      toast.success("Work update added successfully");
      setSelectedTask(null);
      setWorkUpdateForm(initialWorkUpdateForm);
      setFormError("");
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add work update";
      setFormError(message);
      toast.error(message);
    },
  });

  const openWorkUpdateForm = (task) => {
    const currentStatus = getStatusKey(task?.status);
    const allowedStatuses = ["assigned", "in_progress", "on_hold", "completed"];

    setSelectedTask(task);
    setWorkUpdateForm({
      status: allowedStatuses.includes(currentStatus)
        ? currentStatus
        : "in_progress",
      message: "",
    });
    setFormError("");
  };

  const handleWorkUpdateChange = (event) => {
    const { name, value } = event.target;
    setWorkUpdateForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setFormError("");
  };

  const handleWorkUpdateSubmit = (event) => {
    event.preventDefault();

    const message = workUpdateForm.message.trim();

    if (!message) {
      setFormError("Work update message is required");
      return;
    }

    if (!selectedTask?._id) {
      setFormError("Unable to identify the selected task");
      return;
    }

    workUpdateMutation.mutate({
      complaintId: selectedTask._id,
      message,
      status: workUpdateForm.status,
    });
  };

  const {
    data: showAssignedComplaints,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["showAssignedComplaints"],
    queryFn: showAssignedComplaint,
  });

  const allComplaints = useMemo(() => {
    const data = showAssignedComplaints;

    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.assignedComplaints)) {
      return data.assignedComplaints;
    }
    if (Array.isArray(data.result)) return data.result;
    if (Array.isArray(data.data)) return data.data;

    return [];
  }, [showAssignedComplaints]);

  const tasks = useMemo(
    () =>
      allComplaints.filter((complaint) =>
        ["assigned", "in_progress", "completed", "overdue"].includes(
          getStatusKey(complaint?.status),
        ),
      ),
    [allComplaints],
  );

  const inProgressTasks = useMemo(
    () =>
      tasks.filter((task) => getStatusKey(task?.status) === "in_progress"),
    [tasks],
  );

  const filteredTasks = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();

    if (!needle) return inProgressTasks;

    return inProgressTasks.filter((task) =>
      [
        task?.customerId?.name,
        task?.customerId?.email,
        task?.name,
        task?.email,
        task?.subject,
        task?.task?.title,
        task?.status,
        task?.priority,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [inProgressTasks, searchTerm]);

  const stats = [
    {
      label: "All Tasks",
      value: tasks.length,
      detail: "Total assigned work",
      accent: isDarkTheme ? "text-blue-300" : "text-blue-600",
    },
    {
      label: "Assigned",
      value: tasks.filter((task) => getStatusKey(task?.status) === "assigned")
        .length,
      detail: "Ready to begin",
      accent: isDarkTheme ? "text-violet-300" : "text-violet-600",
    },
    {
      label: "In Progress",
      value: tasks.filter(
        (task) => getStatusKey(task?.status) === "in_progress",
      ).length,
      detail: "Currently active",
      accent: isDarkTheme ? "text-orange-300" : "text-orange-500",
    },
    {
      label: "Completed",
      value: tasks.filter((task) => getStatusKey(task?.status) === "completed")
        .length,
      detail: "Finished work",
      accent: isDarkTheme ? "text-emerald-300" : "text-emerald-600",
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
                        In Progress
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
                <h1 className="text-2xl font-bold tracking-normal">In Progress Tasks</h1>
                <p className={`mt-1 max-w-2xl text-sm ${pageTheme.muted}`}>
                  Review assigned complaints, track active work, and inspect
                  task details from one place.
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
                  placeholder="Search tasks, customers, or status"
                  className={`h-12 w-full rounded-none border py-2 pl-12 pr-4 text-sm outline-none transition-colors focus-visible:ring-2 ${pageTheme.field}`}
                />
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                    <h2 className="text-lg font-bold">In Progress Tasks</h2>
                    <p className={`mt-1 text-sm ${pageTheme.muted}`}>
                      Open an active task to review its customer, deadline, and
                      work instructions.
                    </p>
                  </div>
                  <p className={`text-sm ${pageTheme.muted}`}>
                    {isLoading
                      ? "Loading tasks"
                      : `${filteredTasks.length} of ${inProgressTasks.length} shown`}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px] border-separate border-spacing-0 text-left text-sm">
                  <thead className={pageTheme.tableHead}>
                    <tr>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Customer
                      </th>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Task
                      </th>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Status
                      </th>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Priority
                      </th>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Due Date
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
                          colSpan={6}
                          className={`px-5 py-12 text-center ${pageTheme.muted}`}
                        >
                          Loading in-progress tasks...
                        </td>
                      </tr>
                    ) : isError ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-12 text-center text-rose-600"
                        >
                          Failed to load in-progress tasks.
                        </td>
                      </tr>
                    ) : filteredTasks.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className={`px-5 py-12 text-center ${pageTheme.muted}`}
                        >
                          {searchTerm
                            ? "No in-progress tasks match your search."
                            : "No in-progress tasks found."}
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
                        const status = task?.status || "pending";
                        const priority = task?.priority || "medium";

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
                                  "No additional notes provided."}
                              </p>
                            </td>
                            <td className="border-b border-inherit px-5 py-4">
                              <span
                                className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                                  status,
                                  isDarkTheme,
                                )}`}
                              >
                                {formatStatusLabel(status)}
                              </span>
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
                                <Clock3
                                  className={`h-4 w-4 ${pageTheme.muted}`}
                                />
                                {formatDate(
                                  task?.deadline ||
                                    task?.acceptedDate ||
                                    task?.createdAt,
                                )}
                              </span>
                            </td>
                            <td className="border-b border-inherit px-5 py-4">
                              <Button
                                type="button"
                                className="h-9 rounded-none bg-blue-600 px-4 text-white hover:bg-blue-700"
                                onClick={() => openWorkUpdateForm(task)}
                              >
                                Update Task
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
          </main>
        </SidebarInset>
      </SidebarProvider>

      <Sheet
        open={Boolean(selectedTask)}
        onOpenChange={(open) => {
          if (!open && !workUpdateMutation.isPending) {
            setSelectedTask(null);
            setWorkUpdateForm(initialWorkUpdateForm);
            setFormError("");
          }
        }}
      >
        <SheetContent
          side="right"
          className={`${pageTheme.panel} flex h-screen w-full flex-col overflow-hidden p-0 sm:max-w-lg`}
        >
          <SheetHeader
            className={`border-b px-5 pb-5 pt-7 text-left ${pageTheme.divider}`}
          >
            <SheetTitle
              className={isDarkTheme ? "text-slate-100" : "text-[#001a3a]"}
            >
              Add Work Update
            </SheetTitle>
            <SheetDescription className={pageTheme.muted}>
              Record progress and update the current task status.
            </SheetDescription>
          </SheetHeader>

          {selectedTask ? (
            <form
              className="flex flex-1 flex-col overflow-hidden"
              onSubmit={handleWorkUpdateSubmit}
            >
              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
                <section
                  className={`rounded-lg border p-4 ${pageTheme.details}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-xs uppercase ${pageTheme.muted}`}>
                      Task
                    </p>
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                        selectedTask?.status,
                        isDarkTheme,
                      )}`}
                    >
                      {formatStatusLabel(selectedTask?.status)}
                    </span>
                  </div>
                  <p className="mt-1 font-semibold">
                    {selectedTask?.task?.title ||
                      selectedTask?.subject ||
                      "Untitled task"}
                  </p>
                  <p className={`mt-2 text-sm leading-6 ${pageTheme.muted}`}>
                    {selectedTask?.task?.notes ||
                      selectedTask?.message ||
                      "No task notes available."}
                  </p>
                  <p className={`mt-3 text-xs ${pageTheme.muted}`}>
                    Customer:{" "}
                    {selectedTask?.customerId?.name ||
                      selectedTask?.name ||
                      "Unknown customer"}
                  </p>
                </section>

                <div className="space-y-2">
                  <label
                    htmlFor="work-update-status"
                    className="text-sm font-semibold"
                  >
                    Work status
                  </label>
                  <select
                    id="work-update-status"
                    name="status"
                    value={workUpdateForm.status}
                    onChange={handleWorkUpdateChange}
                    disabled={workUpdateMutation.isPending}
                    className={`h-11 w-full rounded-none border px-3 text-sm outline-none transition-colors focus-visible:ring-2 ${pageTheme.field}`}
                  >
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="work-update-message"
                    className="text-sm font-semibold"
                  >
                    Update message
                  </label>
                  <Textarea
                    id="work-update-message"
                    name="message"
                    value={workUpdateForm.message}
                    onChange={handleWorkUpdateChange}
                    disabled={workUpdateMutation.isPending}
                    placeholder="Describe the work completed, current progress, or any blocker..."
                    rows={7}
                    className={`min-h-40 resize-none text-sm ${pageTheme.field}`}
                  />
                  <p className={`text-xs ${pageTheme.muted}`}>
                    This update will be added to the complaint&apos;s work
                    history.
                  </p>
                </div>

                {formError ? (
                  <p className="text-sm font-medium text-rose-600">
                    {formError}
                  </p>
                ) : null}
              </div>

              <div
                className={`flex gap-3 border-t px-5 py-4 ${pageTheme.divider}`}
              >
                <Button
                  type="button"
                  variant="outline"
                  className={`flex-1 rounded-none ${pageTheme.button}`}
                  disabled={workUpdateMutation.isPending}
                  onClick={() => {
                    setSelectedTask(null);
                    setWorkUpdateForm(initialWorkUpdateForm);
                    setFormError("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-none bg-blue-600 text-white hover:bg-blue-700"
                  disabled={workUpdateMutation.isPending}
                >
                  {workUpdateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Save Update
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
