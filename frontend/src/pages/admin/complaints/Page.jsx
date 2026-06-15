import { useState, useEffect } from "react";
import { Moon, Sun, EllipsisVertical, Search } from "lucide-react";
import { AppSidebar } from "../../../components/admin-app-sidebar";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteComplaint,
  showComplain,
  updateComplaint,
} from "../../../services/admin";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function Page() {
  const [theme, setTheme] = useState(false);

  // this is for the search debouncing
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    let timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const toggleTheme = () => {
    setTheme(!theme);
  };

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

  const getStatusBadgeClass = (status) => {
    const normalizedStatus = String(status || "pending")
      .trim()
      .toLowerCase()
      .replace(/[_\s]+/g, "-");

    if (normalizedStatus === "resolved" || normalizedStatus === "completed") {
      return "bg-green-100 text-green-700 text-xs";
    }

    if (normalizedStatus === "in-progress") {
      return "bg-blue-100 text-blue-700 text-xs";
    }

    if (normalizedStatus === "pending") {
      return "bg-yellow-100 text-yellow-700 text-xs";
    }

    return "bg-yellow-100 text-yellow-700 text-xs";
  };

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["showComplaints", debouncedSearch],
    queryFn: () => showComplain(debouncedSearch),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateComplaint(id, { status }),
    onSuccess: () => {
      toast.success("complaint status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["showComplaints"] });
    },
    onError: (error) => {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "failed to update complaint",
      );
    },
  });

  const deleteComplaintMutation = useMutation({
    mutationFn: deleteComplaint,
    onSuccess: () => {
      toast.success("complaint deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["showComplaints"] });
    },
    onError: (error) => {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "failed to delete complaint",
      );
    },
  });

  const complaints = data?.result || [];

  const filteredComplaints = complaints.filter((ticket) =>
    ticket.subject.toLowerCase().includes(debouncedSearch),
  );

  const suggestions = complaints.filter((ticket) =>
    ticket.subject.toLowerCase().includes(search),
  );

  const summaryCards = [
    {
      label: "Total complaints",
      value: complaints.length,
      detail: "All tickets",
    },
    {
      label: "Pending",
      value: complaints.filter(
        (item) => (item?.status || "Pending").toLowerCase() === "pending",
      ).length,
      detail: "Needs review",
    },
    {
      label: "In-Progress",
      value: complaints.filter((item) =>
        ["in_progress", "inProgress"].includes(
          (item?.status || "").toLowerCase(),
        ),
      ).length,
      detail: "Closed items",
    },
    {
      label: "Resolved",
      value: complaints.filter((item) =>
        ["completed", "resolved"].includes((item?.status || "").toLowerCase()),
      ).length,
      detail: "Closed items",
    },
  ];

  const pageTheme = theme
    ? {
        shell: "bg-slate-950 text-slate-100",
        panel: "border-blue-800 bg-slate-900/70 text-slate-100",
        muted: "text-slate-400",
        border: "border-blue-200",
        button: "border-slate-700 text-slate-100 hover:bg-slate-800",
        header: "bg-slate-900/90",
        tableHead: "bg-slate-900 text-slate-200",
        tableRow: "border-slate-800 hover:bg-slate-800/40",
      }
    : {
        shell: "bg-slate-50 text-slate-900",
        panel: "border-blue-200 bg-blue-50 text-slate-900",
        muted: "text-slate-500",
        border: "border-blue-200",
        button: "border-slate-300 text-slate-900 hover:bg-slate-100",
        header: "bg-white/90",
        tableHead: "bg-slate-100 text-slate-700",
        tableRow: "border-slate-200 hover:bg-slate-50",
      };

  return (
    <div className={`${pageTheme.shell} min-h-screen`}>
      {updateStatusMutation.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-6 shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Updating complaint...</p>
          </div>
        </div>
      )}
      <SidebarProvider style={{ backgroundColor: "transparent" }}>
        <AppSidebar />
        <SidebarInset className="flex min-h-screen flex-1 flex-col bg-transparent">
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
                        Complaints
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
          <div className="flex w-full flex-1 flex-col gap-6 p-4 lg:p-6">
            <section
              className={`rounded-2xl border-2 ${pageTheme.border} ${pageTheme.panel} p-6 shadow-sm`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                  <p
                    className={`text-sm font-medium uppercase tracking-[0.2em] ${pageTheme.muted}`}
                  >
                    Complaint management
                  </p>
                  <h1 className="text-2xl font-semibold md:text-3xl">
                    Complaints overview
                  </h1>
                  <p
                    className={`max-w-2xl text-sm leading-6 ${pageTheme.muted}`}
                  >
                    Review incoming complaints, update statuses, and keep
                    response tracking organized.
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-4">
              {summaryCards.map((card) => (
                <article
                  key={card.label}
                  className={`rounded-2xl border-2 ${pageTheme.border} ${pageTheme.panel} p-5 shadow-sm`}
                >
                  <p className={`text-sm ${pageTheme.muted}`}>{card.label}</p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <h2 className="text-3xl font-semibold">{card.value}</h2>
                    <span className={`text-xs ${pageTheme.muted}`}>
                      {card.detail}
                    </span>
                  </div>
                </article>
              ))}
            </section>

            <section
              className={`overflow-hidden rounded-2xl border-2 ${pageTheme.border} ${pageTheme.panel} shadow-sm`}
            >
              <div
                className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${pageTheme.border}`}
              >
                <div>
                  <h2 className="text-lg font-semibold">Complaint table</h2>
                  <p className={`text-sm ${pageTheme.muted}`}>
                    {isLoading
                      ? "Loading complaint records"
                      : `${complaints.length} complaint${complaints.length === 1 ? "" : "s"} available`}
                  </p>
                </div>
                <div className="relative w-64">
                  <div className="flex items-center border-2 border-black rounded-md">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="flex-1 p-2 outline-none"
                    />

                    <button className="px-3">
                      <Search size={20} />
                    </button>
                  </div>

                  {search && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border shadow-md z-50">
                      {suggestions.map((item) => (
                        <div
                          key={item._id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {item.subject}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                  <thead className={pageTheme.tableHead}>
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
                        Subject
                      </th>
                      <th
                        className={`border-b px-5 py-3 font-medium ${pageTheme.border}`}
                      >
                        Message
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
                    </tr>
                  </thead>

                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-10 text-center">
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />{" "}
                            Loading...
                          </span>
                        </td>
                      </tr>
                    ) : complaints.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-10 text-center">
                          No complaints found.
                        </td>
                      </tr>
                    ) : (
                      complaints.map((complaint) => (
                        <tr
                          key={complaint?._id || complaint?.email}
                          className={`transition-colors ${pageTheme.tableRow}`}
                        >
                          <td
                            className={`border-b px-5 py-4 ${pageTheme.border}`}
                          >
                            {complaint?.customerId?.name || "-"}
                          </td>
                          <td
                            className={`border-b px-5 py-4 ${pageTheme.border}`}
                          >
                            {complaint?.customerId?.email || "-"}
                          </td>
                          <td
                            className={`border-b px-5 py-4 ${pageTheme.border}`}
                          >
                            {complaint?.subject || "-"}
                          </td>
                          <td
                            className={`border-b px-5 py-4 ${pageTheme.border}`}
                          >
                            {complaint?.message || "-"}
                          </td>
                          <td
                            className={`border-b px-5 py-4 ${pageTheme.border}`}
                          >
                            <p
                              className={`${getStatusBadgeClass(complaint?.status)} inline-block whitespace-nowrap rounded-full px-3 py-1 text-sm`}
                            >
                              {complaint?.status || "Pending"}
                            </p>
                          </td>
                          <td
                            className={`border-b px-5 py-4 ${pageTheme.border}`}
                          >
                            {complaint?.createdAt
                              ? new Date(
                                  complaint.createdAt,
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                          <td
                            className={`border-b px-5 py-4 ${pageTheme.border}`}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-lg"
                                >
                                  <EllipsisVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                className="w-40"
                                align="start"
                              >
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
                                        status: "completed",
                                      })
                                    }
                                  >
                                    Resolved
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      updateStatusMutation.mutate({
                                        id: complaint?._id,
                                        status: "in_progress",
                                      })
                                    }
                                  >
                                    In-Progress
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      deleteComplaintMutation.mutate(
                                        complaint?._id,
                                      )
                                    }
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
