import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Moon,
  Search,
  Sun,
  UserRound,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  showComplain,
  showEmployee,
  assignTask,
  reassignTask,
} from "../../../services/admin";

export default function Page() {
  const [theme, setTheme] = useState(false);
  const [assignTaskModalOpen, setAssignTaskModalOpen] = useState(false);
  const [assignTaskForm, setAssignTaskForm] = useState({
    complaintId: "",
    employeeId: "",
    taskTitle: "",
    priority: "medium",
    dueDate: "",
    notes: "",
  });

  // this is for the debounce search
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    let timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const isDarkTheme = theme;

  const toggleTheme = () => setTheme((currentTheme) => !currentTheme);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const backgroundColor = isDarkTheme ? "#020617" : "#f8fafc";
    const textColor = isDarkTheme ? "#f8fafc" : "#0f172a";

    root.style.backgroundColor = backgroundColor;
    body.style.backgroundColor = backgroundColor;
    body.style.color = textColor;
    root.classList.toggle("dark", isDarkTheme);
  }, [isDarkTheme]);

  // this is for assign task
  const taskMutation = useMutation({
    mutationFn: assignTask,
    onSuccess: () => {
      console.log("Success");
      resetAssignTaskForm();
      setAssignTaskModalOpen(false);
    },
    onError: (error) => {
      console.log("Error", error.message);
    },
  });

  const { data: complaintData, isLoading: isComplaintsLoading } = useQuery({
    queryKey: ["adminAcceptedComplaints"],
    queryFn: showComplain,
  });

  const { data: employeeData, isLoading: isEmployeesLoading } = useQuery({
    queryKey: ["adminEmployees"],
    queryFn: showEmployee,
  });

  //  console.log(employeeData?.result?.map((employees)=> employees.employee?.email))

  console.log(employeeData);

  const complaints = Array.isArray(complaintData?.result)
    ? complaintData.result
    : [];

  const employees = employeeData?.result?.map((item) => item.employee) ?? [];

  console.log(employees);

  const acceptedComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const status = String(complaint?.status || "").toLowerCase();

      return (
        Boolean(complaint?.acceptedDate) ||
        ["assigned", "in_progress", "in progress", "completed"].includes(status)
      );
    });
  }, [complaints]);

  const selectedComplaint = acceptedComplaints.find(
    (complaint) => complaint?._id === assignTaskForm.complaintId,
  );

  const filteredComplaints = acceptedComplaints.filter((complaint) => {
    const subject = String(complaint?.subject || "").toLowerCase();
    const customerName = String(
      complaint?.customerId?.name || "",
    ).toLowerCase();
    const customerEmail = String(
      complaint?.customerId?.email || "",
    ).toLowerCase();

    const needle = debouncedSearch.trim().toLowerCase();

    if (!needle) return true;

    return (
      subject.includes(needle) ||
      customerName.includes(needle) ||
      customerEmail.includes(needle)
    );
  });

 const suggestions =
  debouncedSearch.trim() === ""
    ? []
    : acceptedComplaints
        .filter((complaint) =>
          complaint.subject
            ?.toLowerCase()
            .includes(debouncedSearch.toLowerCase())
        )
        .slice(0, 5);

  const pageTheme = isDarkTheme
    ? {
        shell: "bg-slate-950 text-slate-100",
        panel: "border-slate-800 bg-slate-900/70 text-slate-100",
        soft: "bg-slate-900/50",
        muted: "text-slate-400",
        border: "border-slate-800",
        header: "bg-slate-900/90",
        tableHead: "bg-slate-900 text-slate-200",
        tableRow: "border-slate-800 hover:bg-slate-800/40",
        button: "border-slate-700 text-slate-100 hover:bg-slate-800",
        field:
          "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-sky-500",
      }
    : {
        shell: "bg-slate-50 text-slate-900",
        panel: "border-slate-200 bg-white text-slate-900",
        soft: "bg-sky-50",
        muted: "text-slate-500",
        border: "border-slate-200",
        header: "bg-white/90",
        tableHead: "bg-slate-100 text-slate-700",
        tableRow: "border-slate-200 hover:bg-slate-50",
        button: "border-slate-300 text-slate-900 hover:bg-slate-100",
        field:
          "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-sky-500",
      };

  const stats = [
    {
      label: "Accepted complaints",
      value: acceptedComplaints.length,
      detail: "Ready for assignment",
      icon: CheckCircle2,
      accent: isDarkTheme ? "text-sky-400" : "text-sky-600",
      iconWrap: isDarkTheme
        ? "border-slate-700 bg-slate-800"
        : "border-sky-100 bg-white",
    },
    {
      label: "Available employees",
      value: isEmployeesLoading ? "..." : employees.length,
      detail: "Active team members",
      icon: UserRound,
      accent: isDarkTheme ? "text-emerald-400" : "text-emerald-600",
      iconWrap: isDarkTheme
        ? "border-slate-700 bg-slate-800"
        : "border-emerald-100 bg-white",
    },
    {
      label: "Selectable tasks",
      value: filteredComplaints.length,
      detail: search ? "Filtered results" : "Current queue",
      icon: Clock3,
      accent: isDarkTheme ? "text-amber-400" : "text-amber-600",
      iconWrap: isDarkTheme
        ? "border-slate-700 bg-slate-800"
        : "border-amber-100 bg-white",
    },
  ];

  const handleAssignTaskInputChange = (event) => {
    const { name, value } = event.target;
    setAssignTaskForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetAssignTaskForm = () => {
    setAssignTaskForm({
      complaintId: "",
      employeeId: "",
      taskTitle: "",
      priority: "medium",
      dueDate: "",
      notes: "",
    });
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
                onClick={toggleTheme}
              >
                {isDarkTheme ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>
            </div>
          </header>

          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 lg:p-6">
            <section
              className={`rounded-3xl border ${pageTheme.border} ${pageTheme.panel} overflow-hidden shadow-sm`}
            >
              <div className="space-y-6 p-6 xl:p-8">
                <div className="space-y-3">
                  <p
                    className={`text-sm font-medium uppercase tracking-[0.24em] ${pageTheme.muted}`}
                  >
                    Task orchestration
                  </p>
                  <h1 className="max-w-4xl text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
                    Assign work from a focused command panel.
                  </h1>
                  <p
                    className={`max-w-3xl text-sm leading-6 ${pageTheme.muted}`}
                  >
                    Pick an accepted complaint, match it to an available
                    employee, and keep the assignment details structured in one
                    place.
                  </p>
                </div>
              </div>
            </section>
            <section className={`rounded-3xl border overflow-hidden shadow-sm`}>
              <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <article
                      key={stat.label}
                      className={`rounded-2xl border ${pageTheme.border} ${pageTheme.soft} p-4 shadow-sm`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`text-sm ${pageTheme.muted}`}>
                            {stat.label}
                          </p>
                          <p
                            className={`mt-3 text-3xl font-semibold ${stat.accent}`}
                          >
                            {stat.value}
                          </p>
                          <p className={`mt-2 text-xs ${pageTheme.muted}`}>
                            {stat.detail}
                          </p>
                        </div>
                        <div
                          className={`rounded-xl border p-3 ${stat.iconWrap}`}
                        >
                          <Icon className={stat.accent} size={18} />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="space-y-6">
              <article
                className={`w-full rounded-3xl border ${pageTheme.border} ${pageTheme.panel} overflow-hidden shadow-sm`}
              >
                <div
                  className={`border-b ${pageTheme.border} px-5 py-4 sm:px-6`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">
                        Accepted complaints
                      </h2>
                      <p className={`text-sm ${pageTheme.muted}`}>
                        {isComplaintsLoading
                          ? "Loading complaint queue"
                          : `${acceptedComplaints.length} complaint${acceptedComplaints.length === 1 ? "" : "s"} ready for assignment`}
                      </p>
                    </div>

                    <div className="relative w-full  md:w-96">
                      <Search
                        className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${pageTheme.muted}`}
                      />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search subject"
                        className={`pl-9 outline-none ${pageTheme.field}`}
                      />

                      {search.trim() && suggestions.length > 0 && (
                        <div
                          className={`absolute top-full left-0 mt-1 w-full rounded-md border shadow-lg z-50 ${
                            isDarkTheme
                              ? "bg-slate-900 border-slate-700"
                              : "bg-white border-slate-200"
                          }`}
                        >
                          {suggestions.map((item) => (
                            <div
                              key={item._id}
                              onClick={() => setSearch(item.subject)}
                              className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              {item.subject}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left text-sm">
                    <thead className={pageTheme.tableHead}>
                      <tr>
                        <th
                          className={`border-b px-5 py-3 font-medium ${pageTheme.border}`}
                        >
                          Customer
                        </th>
                        <th
                          className={`border-b px-5 py-3 font-medium ${pageTheme.border}`}
                        >
                          Subject
                        </th>
                        <th
                          className={`border-b px-5 py-3 font-medium ${pageTheme.border}`}
                        >
                          Status
                        </th>
                        <th
                          className={`border-b px-5 py-3 font-medium ${pageTheme.border}`}
                        >
                          Date
                        </th>

                        <th
                          className={`border-b px-5 py-3 font-medium ${pageTheme.border}`}
                        >
                          Action
                        </th>
                        <th
                          className={`border-b px-5 py-3 font-medium ${pageTheme.border}`}
                        >
                          DeadLine Date
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredComplaints.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className={`px-5 py-14 text-center ${pageTheme.muted}`}
                          >
                            No accepted complaints found.
                          </td>
                        </tr>
                      ) : (
                        filteredComplaints.map((complaint) => {
                          const status = String(
                            complaint?.status || "",
                          ).toLowerCase();
                          const statusClass =
                            status === "completed"
                              ? isDarkTheme
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-emerald-100 text-emerald-700"
                              : isDarkTheme
                                ? "bg-amber-500/15 text-amber-300"
                                : "bg-amber-100 text-amber-700";

                          return (
                            <tr
                              key={complaint?._id || complaint?.subject}
                              className={`transition-colors ${pageTheme.tableRow}`}
                            >
                              <td
                                className={`border-b px-5 py-4 ${pageTheme.border}`}
                              >
                                <div>
                                  <p className="font-medium">
                                    {complaint?.customerId?.name ||
                                      complaint?.name ||
                                      "-"}
                                  </p>
                                  <p className={`text-xs ${pageTheme.muted}`}>
                                    {complaint?.customerId?.email ||
                                      complaint?.email ||
                                      "-"}
                                  </p>
                                </div>
                              </td>
                              <td
                                className={`border-b px-5 py-4 ${pageTheme.border}`}
                              >
                                {complaint?.subject || "-"}
                              </td>
                              <td
                                className={`border-b px-5 py-4 ${pageTheme.border}`}
                              >
                                <span
                                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}
                                >
                                  {complaint?.status || "pending"}
                                </span>
                              </td>
                              <td
                                className={`border-b px-5 py-4 ${pageTheme.border}`}
                              >
                                {complaint?.acceptedDate
                                  ? new Date(
                                      complaint.acceptedDate,
                                    ).toLocaleDateString()
                                  : complaint?.createdAt
                                    ? new Date(
                                        complaint.createdAt,
                                      ).toLocaleDateString()
                                    : "-"}
                              </td>
                              <td
                                className={`border-b px-5 py-4 ${pageTheme.border}`}
                              >
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-lg"
                                    onClick={() => {
                                      setAssignTaskForm((prev) => ({
                                        ...prev,
                                        complaintId: complaint?._id || "",
                                      }));
                                      setAssignTaskModalOpen(true);
                                    }}
                                  >
                                    {complaint?.status === "assigned"
                                      ? "re-assign"
                                      : "assign"}
                                  </Button>
                                </div>
                              </td>
                              <td
                                className={`border-b px-5 py-4 ${pageTheme.border}`}
                              >
                                {complaint?.status === "assigned" ? (
                                  <p>
                                    {new Date(
                                      complaint?.deadline,
                                    ).toLocaleDateString()}
                                  </p>
                                ) : (
                                  <p>not assigned yet</p>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </article>
            </section>
          </div>
        </SidebarInset>
      </SidebarProvider>

      <Sheet open={assignTaskModalOpen} onOpenChange={setAssignTaskModalOpen}>
        <SheetContent
          side="right"
          className={`${isDarkTheme ? "bg-slate-900 text-slate-100 border-slate-700" : "bg-white text-slate-900 border-slate-200"} flex h-screen w-full flex-col overflow-hidden sm:w-120`}
        >
          <SheetHeader className="border-b border-inherit px-4 pb-4 pt-6">
            <SheetTitle
              className={isDarkTheme ? "text-slate-100" : "text-slate-900"}
            >
              Assign Task
            </SheetTitle>
            <SheetDescription
              className={isDarkTheme ? "text-slate-400" : "text-slate-600"}
            >
              Fill in the complaint, employee, and work details to assign the
              task.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleAssignTaskSubmit}
            className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="complaintId">
                Accepted Complaint
              </label>
              <select
                id="complaintId"
                name="complaintId"
                value={assignTaskForm.complaintId}
                onChange={handleAssignTaskInputChange}
                required
                className={`h-10 w-full rounded-lg border px-3 text-sm outline-none transition-colors ${isDarkTheme ? "border-slate-700 bg-slate-950 text-slate-100 focus:border-sky-500" : "border-slate-300 bg-white text-slate-900 focus:border-sky-500"}`}
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
              <label className="text-sm font-medium" htmlFor="employeeId">
                Employee
              </label>
              <select
                id="employeeId"
                name="employeeId"
                value={assignTaskForm.employeeId}
                onChange={handleAssignTaskInputChange}
                required
                className={`h-10 w-full rounded-lg border px-3 text-sm outline-none transition-colors ${isDarkTheme ? "border-slate-700 bg-slate-950 text-slate-100 focus:border-sky-500" : "border-slate-300 bg-white text-slate-900 focus:border-sky-500"}`}
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
                className={`space-y-4 rounded-2xl border p-4 ${isDarkTheme ? "border-slate-700 bg-slate-950/60" : "border-sky-200 bg-blue-50"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">
                    Selected complaint details
                  </h3>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${isDarkTheme ? "border-slate-700 bg-slate-900 text-slate-100" : "border-sky-200 bg-white text-sky-700"}`}
                  >
                    {selectedComplaint?.status || "pending"}
                  </span>
                </div>

                <div className="grid gap-3 text-sm">
                  <div>
                    <p
                      className={`text-xs uppercase tracking-wide ${isDarkTheme ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Customer
                    </p>
                    <p className="font-medium">
                      {selectedComplaint?.customerId?.name || "-"}
                    </p>
                    <p
                      className={
                        isDarkTheme ? "text-slate-400" : "text-slate-600"
                      }
                    >
                      {selectedComplaint?.customerId?.email || "-"}
                    </p>
                  </div>

                  <div>
                    <p
                      className={`text-xs uppercase tracking-wide ${isDarkTheme ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Subject
                    </p>
                    <p className="font-medium">
                      {selectedComplaint?.subject || "-"}
                    </p>
                  </div>

                  <div>
                    <p
                      className={`text-xs uppercase tracking-wide ${isDarkTheme ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Message
                    </p>
                    <p className="leading-6">
                      {selectedComplaint?.message || "-"}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p
                        className={`text-xs uppercase tracking-wide ${isDarkTheme ? "text-slate-400" : "text-slate-500"}`}
                      >
                        Service Type
                      </p>
                      <p className="font-medium">
                        {selectedComplaint?.serviceType || "-"}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-xs uppercase tracking-wide ${isDarkTheme ? "text-slate-400" : "text-slate-500"}`}
                      >
                        Priority
                      </p>
                      <p className="font-medium capitalize">
                        {selectedComplaint?.priority || "-"}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-xs uppercase tracking-wide ${isDarkTheme ? "text-slate-400" : "text-slate-500"}`}
                      >
                        Accepted Date
                      </p>
                      <p className="font-medium">
                        {selectedComplaint?.acceptedDate
                          ? new Date(
                              selectedComplaint.acceptedDate,
                            ).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-xs uppercase tracking-wide ${isDarkTheme ? "text-slate-400" : "text-slate-500"}`}
                      >
                        Raised Date
                      </p>
                      <p className="font-medium">
                        {selectedComplaint?.createdAt
                          ? new Date(
                              selectedComplaint.createdAt,
                            ).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="taskTitle">
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
                className={pageTheme.field}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={assignTaskForm.priority}
                onChange={handleAssignTaskInputChange}
                className={`h-10 w-full rounded-lg border px-3 text-sm outline-none transition-colors ${isDarkTheme ? "border-slate-700 bg-slate-950 text-slate-100 focus:border-sky-500" : "border-slate-300 bg-white text-slate-900 focus:border-sky-500"}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="dueDate">
                Due Date
              </label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={assignTaskForm.dueDate}
                onChange={handleAssignTaskInputChange}
                required
                className={pageTheme.field}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="notes">
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

            <div className="flex items-center gap-2 pt-2">
              
              <Button type="submit" className="flex-1">
                Assign Task
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
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
