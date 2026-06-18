import { useEffect, useMemo, useState } from "react";
import { Moon, Search, Sun } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppSidebar } from "../../../components/admin-app-sidebar";
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
import { Textarea } from "../../../components/ui/textarea";
import {
  assignTask,
  showComplain,
  showEmployee,
} from "../../../services/admin";

const getStatusKey = (status) =>
  String(status || "pending")
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/_+/g, "_");

const formatStatusLabel = (status) =>
  getStatusKey(status)
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

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

const getStatusBadgeClass = (status, isDarkTheme) => {
  const statusKey = getStatusKey(status);
  const statusClasses = isDarkTheme
    ? {
        accepted: "bg-cyan-950 text-cyan-200",
        assigned: "bg-violet-950 text-violet-200",
        in_progress: "bg-blue-950 text-blue-200",
        completed: "bg-emerald-950 text-emerald-200",
        resolved: "bg-emerald-950 text-emerald-200",
      }
    : {
        accepted: "bg-cyan-100 text-cyan-700",
        assigned: "bg-violet-100 text-violet-700",
        in_progress: "bg-blue-100 text-blue-700",
        completed: "bg-emerald-100 text-emerald-700",
        resolved: "bg-emerald-100 text-emerald-700",
      };

  return (
    statusClasses[statusKey] ||
    (isDarkTheme
      ? "bg-slate-800 text-slate-200"
      : "bg-amber-100 text-amber-700")
  );
};

const initialAssignTaskForm = {
  complaintId: "",
  employeeId: "",
  taskTitle: "",
  priority: "medium",
  dueDate: "",
  notes: "",
};

export default function Page() {
  const [theme, setTheme] = useState(false);
  const [assignTaskModalOpen, setAssignTaskModalOpen] = useState(false);
  const [assignTaskForm, setAssignTaskForm] = useState(initialAssignTaskForm);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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
        suggestionHover: "hover:bg-[#eef6ff]",
        details: "border-[#b8d8ff] bg-[#eef6ff]",
      };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
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

  const { data: complaintData, isLoading: isComplaintsLoading } = useQuery({
    queryKey: ["adminAcceptedComplaints"],
    queryFn: showComplain,
  });

  const { data: employeeData, isLoading: isEmployeesLoading } = useQuery({
    queryKey: ["adminEmployees"],
    queryFn: showEmployee,
  });

  const complaints = useMemo(
    () => (Array.isArray(complaintData?.result) ? complaintData.result : []),
    [complaintData],
  );

  const employees = useMemo(
    () =>
      Array.isArray(employeeData?.result)
        ? employeeData.result.map((item) => item?.employee).filter(Boolean)
        : [],
    [employeeData],
  );

  const acceptedComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const status = getStatusKey(complaint?.status);

      return (
        Boolean(complaint?.acceptedDate) ||
        [
          "accepted",
          "assigned",
          "in_progress",
          "completed",
          "resolved",
        ].includes(status)
      );
    });
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    if (!debouncedSearch) return acceptedComplaints;

    return acceptedComplaints.filter((complaint) =>
      [
        complaint?.customerId?.name,
        complaint?.customerId?.email,
        complaint?.name,
        complaint?.email,
        complaint?.subject,
        complaint?.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(debouncedSearch),
    );
  }, [acceptedComplaints, debouncedSearch]);

  const suggestions = useMemo(() => {
    const needle = search.trim().toLowerCase();

    if (!needle) return [];

    return acceptedComplaints
      .filter((complaint) =>
        String(complaint?.subject || "")
          .toLowerCase()
          .includes(needle),
      )
      .slice(0, 5);
  }, [acceptedComplaints, search]);

  const selectedComplaint = acceptedComplaints.find(
    (complaint) => complaint?._id === assignTaskForm.complaintId,
  );

  const awaitingAssignment = acceptedComplaints.filter(
    (complaint) =>
      !["assigned", "in_progress", "completed", "resolved"].includes(
        getStatusKey(complaint?.status),
      ),
  ).length;

  const assignedTasks = acceptedComplaints.filter((complaint) =>
    ["assigned", "in_progress"].includes(getStatusKey(complaint?.status)),
  ).length;

  const stats = [
    {
      label: "Accepted Complaints",
      value: acceptedComplaints.length,
      detail: "Ready in the task queue",
      accent: isDarkTheme ? "text-blue-300" : "text-blue-600",
    },
    {
      label: "Awaiting Assignment",
      value: awaitingAssignment,
      detail: "Not assigned yet",
      accent: isDarkTheme ? "text-orange-300" : "text-orange-500",
    },
    {
      label: "Assigned Tasks",
      value: assignedTasks,
      detail: "Currently allocated",
      accent: isDarkTheme ? "text-violet-300" : "text-blue-600",
    },
    {
      label: "Available Employees",
      value: isEmployeesLoading ? "..." : employees.length,
      detail: "Active team members",
      accent: isDarkTheme ? "text-emerald-300" : "text-emerald-600",
    },
  ];

  const resetAssignTaskForm = () => {
    setAssignTaskForm(initialAssignTaskForm);
  };

  const taskMutation = useMutation({
    mutationFn: assignTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["adminAcceptedComplaints"],
      });
      resetAssignTaskForm();
      setAssignTaskModalOpen(false);
    },
    onError: (error) => {
      console.error("Failed to assign task:", error);
    },
  });

  const handleAssignTaskInputChange = (event) => {
    const { name, value } = event.target;

    setAssignTaskForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleAssignTaskSubmit = (event) => {
    event.preventDefault();
    taskMutation.mutate({
      complaintId: assignTaskForm.complaintId,
      employeeId: assignTaskForm.employeeId,
      taskTitle: assignTaskForm.taskTitle,
      priority: assignTaskForm.priority,
      dueDate: assignTaskForm.dueDate,
      taskNotes: assignTaskForm.notes,
    });
  };

  const openAssignTaskModal = (complaintId) => {
    setAssignTaskForm((currentForm) => ({
      ...currentForm,
      complaintId,
    }));
    setAssignTaskModalOpen(true);
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
                        Assign Task
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
                  Assign Tasks
                </h1>
                <p className={`mt-1 max-w-2xl text-sm ${pageTheme.muted}`}>
                  Review accepted complaints, choose the right employee, and
                  keep every assignment moving from one place.
                </p>
              </div>

              <div className="relative w-full xl:w-[30rem]">
                <Search
                  className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${pageTheme.muted}`}
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search accepted complaints"
                  className={`h-12 w-full rounded-none border py-2 pl-12 pr-4 text-sm outline-none transition-colors focus-visible:ring-2 ${pageTheme.field}`}
                />

                {suggestions.length > 0 ? (
                  <div
                    className={`absolute left-0 top-full z-50 mt-1 w-full overflow-hidden border shadow-lg ${pageTheme.panel}`}
                  >
                    {suggestions.map((item) => (
                      <button
                        key={item?._id}
                        type="button"
                        className={`block w-full px-4 py-3 text-left text-sm transition-colors ${pageTheme.suggestionHover}`}
                        onClick={() => setSearch(item?.subject || "")}
                      >
                        {item?.subject || "Untitled complaint"}
                      </button>
                    ))}
                  </div>
                ) : null}
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
                    <h2 className="text-lg font-bold">Accepted Complaints</h2>
                    <p className={`mt-1 text-sm ${pageTheme.muted}`}>
                      Select a complaint to create or update its task
                      assignment.
                    </p>
                  </div>
                  <p className={`text-sm ${pageTheme.muted}`}>
                    {isComplaintsLoading
                      ? "Loading complaints"
                      : `${filteredComplaints.length} of ${acceptedComplaints.length} shown`}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px] border-separate border-spacing-0 text-left text-sm">
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
                        Status
                      </th>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Accepted Date
                      </th>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Deadline
                      </th>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {isComplaintsLoading ? (
                      <tr>
                        <td
                          colSpan={7}
                          className={`px-5 py-12 text-center ${pageTheme.muted}`}
                        >
                          Loading accepted complaints...
                        </td>
                      </tr>
                    ) : filteredComplaints.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className={`px-5 py-12 text-center ${pageTheme.muted}`}
                        >
                          {search
                            ? "No accepted complaints match your search."
                            : "No accepted complaints found."}
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints.map((complaint) => {
                        const statusKey = getStatusKey(complaint?.status);
                        const isAssigned = statusKey === "assigned";

                        return (
                          <tr
                            key={complaint?._id || complaint?.email}
                            className={`transition-colors ${pageTheme.tableRow}`}
                          >
                            <td className="border-b border-inherit px-5 py-4 font-medium">
                              {complaint?.customerId?.name ||
                                complaint?.name ||
                                "-"}
                            </td>
                            <td className="border-b border-inherit px-5 py-4">
                              {complaint?.customerId?.email ||
                                complaint?.email ||
                                "-"}
                            </td>
                            <td className="max-w-xs border-b border-inherit px-5 py-4">
                              {complaint?.subject || "-"}
                            </td>
                            <td className="border-b border-inherit px-5 py-4">
                              <span
                                className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                                  complaint?.status,
                                  isDarkTheme,
                                )}`}
                              >
                                {formatStatusLabel(complaint?.status)}
                              </span>
                            </td>
                            <td className="whitespace-nowrap border-b border-inherit px-5 py-4">
                              {formatDate(
                                complaint?.acceptedDate || complaint?.createdAt,
                              )}
                            </td>
                            <td className="whitespace-nowrap border-b border-inherit px-5 py-4">
                              {complaint?.deadline
                                ? formatDate(complaint.deadline)
                                : "Not assigned yet"}
                            </td>
                            <td className="border-b border-inherit px-5 py-4">
                              <Button
                                type="button"
                                className="h-9 rounded-none bg-blue-600 px-4 text-white hover:bg-blue-700"
                                onClick={() =>
                                  openAssignTaskModal(complaint?._id || "")
                                }
                              >
                                {isAssigned ? "Re-assign" : "Assign"}
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
        open={assignTaskModalOpen}
        onOpenChange={(open) => {
          setAssignTaskModalOpen(open);

          if (!open && !taskMutation.isPending) {
            resetAssignTaskForm();
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
              Assign Task
            </SheetTitle>
            <SheetDescription className={pageTheme.muted}>
              Add the employee, deadline, and task instructions for this
              complaint.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleAssignTaskSubmit}
            className="flex-1 space-y-5 overflow-y-auto px-5 py-5"
          >
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="complaintId">
                Accepted Complaint
              </label>
              <select
                id="complaintId"
                name="complaintId"
                value={assignTaskForm.complaintId}
                onChange={handleAssignTaskInputChange}
                required
                className={`h-11 w-full rounded-md border px-3 text-sm outline-none transition-colors focus-visible:ring-2 ${pageTheme.field}`}
              >
                <option value="">Select an accepted complaint</option>
                {acceptedComplaints.length === 0 ? (
                  <option value="" disabled>
                    No accepted complaints available
                  </option>
                ) : (
                  acceptedComplaints.map((complaint) => (
                    <option key={complaint?._id} value={complaint?._id}>
                      {`${complaint?.customerId?.name || complaint?.customerId?.email || "Customer"} - ${complaint?.subject || "Untitled complaint"}`}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="employeeId">
                Employee
              </label>
              <select
                id="employeeId"
                name="employeeId"
                value={assignTaskForm.employeeId}
                onChange={handleAssignTaskInputChange}
                required
                className={`h-11 w-full rounded-md border px-3 text-sm outline-none transition-colors focus-visible:ring-2 ${pageTheme.field}`}
              >
                <option value="">Select an employee</option>
                {employees.length === 0 ? (
                  <option value="" disabled>
                    No employees available
                  </option>
                ) : (
                  employees.map((employee) => (
                    <option
                      key={employee?._id || employee?.email}
                      value={employee?._id || ""}
                    >
                      {`${employee?.name || "Employee"} - ${employee?.email || "No email"}`}
                    </option>
                  ))
                )}
              </select>
            </div>

            {selectedComplaint ? (
              <div
                className={`space-y-4 rounded-lg border p-4 ${pageTheme.details}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold">
                    Selected Complaint Details
                  </h3>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                      selectedComplaint?.status,
                      isDarkTheme,
                    )}`}
                  >
                    {formatStatusLabel(selectedComplaint?.status)}
                  </span>
                </div>

                <div className="grid gap-4 text-sm">
                  <div>
                    <p className={`text-xs uppercase ${pageTheme.muted}`}>
                      Customer
                    </p>
                    <p className="mt-1 font-semibold">
                      {selectedComplaint?.customerId?.name || "-"}
                    </p>
                    <p className={pageTheme.muted}>
                      {selectedComplaint?.customerId?.email || "-"}
                    </p>
                  </div>

                  <div>
                    <p className={`text-xs uppercase ${pageTheme.muted}`}>
                      Subject
                    </p>
                    <p className="mt-1 font-semibold">
                      {selectedComplaint?.subject || "-"}
                    </p>
                  </div>

                  <div>
                    <p className={`text-xs uppercase ${pageTheme.muted}`}>
                      Message
                    </p>
                    <p className="mt-1 leading-6">
                      {selectedComplaint?.message || "-"}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className={`text-xs uppercase ${pageTheme.muted}`}>
                        Service Type
                      </p>
                      <p className="mt-1 font-semibold">
                        {selectedComplaint?.serviceType || "-"}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs uppercase ${pageTheme.muted}`}>
                        Priority
                      </p>
                      <p className="mt-1 font-semibold capitalize">
                        {selectedComplaint?.priority || "-"}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs uppercase ${pageTheme.muted}`}>
                        Accepted Date
                      </p>
                      <p className="mt-1 font-semibold">
                        {formatDate(selectedComplaint?.acceptedDate)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs uppercase ${pageTheme.muted}`}>
                        Raised Date
                      </p>
                      <p className="mt-1 font-semibold">
                        {formatDate(selectedComplaint?.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="taskTitle">
                Task Title
              </label>
              <Input
                id="taskTitle"
                name="taskTitle"
                type="text"
                value={assignTaskForm.taskTitle}
                onChange={handleAssignTaskInputChange}
                placeholder="e.g. Resolve AC maintenance ticket"
                required
                className={`h-11 ${pageTheme.field}`}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold" htmlFor="priority">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={assignTaskForm.priority}
                  onChange={handleAssignTaskInputChange}
                  className={`h-11 w-full rounded-md border px-3 text-sm outline-none transition-colors focus-visible:ring-2 ${pageTheme.field}`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold" htmlFor="dueDate">
                  Due Date
                </label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={assignTaskForm.dueDate}
                  onChange={handleAssignTaskInputChange}
                  required
                  className={`h-11 ${pageTheme.field}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="notes">
                Task Notes
              </label>
              <Textarea
                id="notes"
                name="notes"
                value={assignTaskForm.notes}
                onChange={handleAssignTaskInputChange}
                placeholder="Add instructions for the employee"
                rows={4}
                className={pageTheme.field}
              />
            </div>

            <div
              className={`sticky bottom-0 flex items-center gap-3 border-t py-4 ${pageTheme.divider} ${isDarkTheme ? "bg-slate-900" : "bg-white"}`}
            >
              <Button
                type="submit"
                disabled={taskMutation.isPending}
                className="h-11 flex-1 rounded-none bg-blue-600 text-white hover:bg-blue-700"
              >
                {taskMutation.isPending ? "Assigning..." : "Assign Task"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={taskMutation.isPending}
                className={`h-11 flex-1 rounded-none ${pageTheme.button}`}
                onClick={() => {
                  resetAssignTaskForm();
                  setAssignTaskModalOpen(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
