import { useEffect, useState } from "react";
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

import { Separator } from "../../../components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import { showEmployee, showUser } from "../../../services/admin";
import { showComplain } from "../../../services/admin";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const [theme, setTheme] = useState(false);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);

  const getStatusBadgeClass = (status) => {
    const normalizedStatus = (status || "Pending").toLowerCase();

    if (normalizedStatus === "resolved") {
      return "bg-green-100 text-green-700";
    }

    if (
      normalizedStatus === "in-progress" ||
      normalizedStatus === "in progress"
    ) {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

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

  const { data, isLoading } = useQuery({
    queryKey: ["showComplaints"],
    queryFn: showComplain,
  });

  const { data: customerData, isLoading: isCustomerLoading } = useQuery({
    queryKey: ["adminCustomers"],
    queryFn: showUser,
  });

  const { data: employeeData, isLoading: isEmployeeLoading } = useQuery({
    queryKey: ["adminEmployees"],
    queryFn: showEmployee,
  });

  const complaints = data?.result || [];
  const customers = customerData?.result || [];
  const employees = employeeData?.result || [];

  console.log(complaints);

  const stats = [
    {
      label: "Total customers",
      value: isCustomerLoading ? "..." : customers.length,
      detail: "Registered users",
    },
    {
      label: "Total employees",
      value: isEmployeeLoading ? "..." : employees.length,
      detail: "Active staff",
    },
    {
      label: "Complaints",
      value: complaints.length,
      detail: "All recorded tickets",
    },
  ];

  const recentComplaints = complaints.slice(0, 5);

  const pageTheme = theme
    ? {
        shell: "bg-slate-950 text-slate-100",
        panel: "border-slate-800 bg-slate-900/70 text-slate-100",
        muted: "text-slate-400",
        border: "border-slate-800",
        button: "border-slate-700 text-slate-100 hover:bg-slate-800",
        header: "bg-slate-900/90",
        tableHead: "bg-slate-900 text-slate-200",
        tableRow: "border-slate-800 hover:bg-slate-800/40",
      }
    : {
        shell: "bg-slate-50 text-slate-900",
        panel: "border-slate-200 bg-white text-slate-900",
        muted: "text-slate-500",
        border: "border-slate-200",
        button: "border-slate-300 text-slate-900 hover:bg-slate-100",
        header: "bg-white/90",
        tableHead: "bg-slate-100 text-slate-700",
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
                        Dashboard
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
   

            <section className="grid gap-5 md:grid-cols-4 xl:grid-cols-4">
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className={`rounded-2xl border ${pageTheme.border} ${pageTheme.panel} p-5 shadow-sm`}
                >
                  <p className={`text-sm ${pageTheme.muted}`}>{stat.label}</p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <h2 className="text-3xl font-semibold">{stat.value}</h2>
                    <span className={`text-xs ${pageTheme.muted}`}>
                      {stat.detail}
                    </span>
                  </div>
                </article>
              ))}
            </section>

            <section
              className={`overflow-hidden rounded-2xl border ${pageTheme.border} ${pageTheme.panel} shadow-sm`}
            >
              <div
                className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${pageTheme.border}`}
              >
                <div>
                  <h2 className="text-lg font-semibold">Recent complaints</h2>
                  <p className={`text-sm ${pageTheme.muted}`}>
                    {isLoading
                      ? "Loading complaint data"
                      : `${complaints.length} complaint${complaints.length === 1 ? "" : "s"} available`}
                  </p>
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
                        Status
                      </th>
                      <th
                        className={`border-b px-5 py-3 font-medium ${pageTheme.border}`}
                      >
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : recentComplaints.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center">
                          No complaints found.
                        </td>
                      </tr>
                    ) : (
                      recentComplaints.map((complaint) => (
                        <tr
                          key={complaint?._id || complaint?.email}
                          className={`transition-colors ${pageTheme.tableRow}`}
                        >
                          <td
                            className={`border-b px-5 py-4 ${pageTheme.border}`}
                          >
                            {complaint?.name || "-"}
                          </td>
                          <td
                            className={`border-b px-5 py-4 ${pageTheme.border}`}
                          >
                            {complaint?.email || "-"}
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
                              className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(complaint?.status)}`}
                            >
                              {complaint?.status || "Pending"}
                            </span>
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
