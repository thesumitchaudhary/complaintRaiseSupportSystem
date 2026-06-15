import { useEffect, useState } from "react";
import { Moon, Sun, Search } from "lucide-react";
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
import { getRaisedComplaint } from "../../../services/user";
import { showUser } from "../../../services/admin";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const [theme, setTheme] = useState(false);

  // this is for the debouncing search

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const toggleTheme = () => setTheme((currentTheme) => !currentTheme);

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

  const { data } = useQuery({
    queryKey: ["showRaisedTicked"],
    queryFn: getRaisedComplaint,
  });

  const { data: data1 } = useQuery({
    queryKey: ["showUserToAdmin", debouncedSearch],
    queryFn: () => showUser(debouncedSearch),
  });

  const users = data1?.result || [];
  const complaints = data?.result || [];

  const filteredUsers = users.filter((user) =>
    (user?.name || "").toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  const suggestions = users.filter((user) =>
    (user?.name || "").toLowerCase().includes(search.toLowerCase()),
  );

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

  const getStatusBadgeClass = (count) => {
    if (count > 0) {
      return theme
        ? "bg-amber-500/15 text-amber-300"
        : "bg-amber-100 text-amber-700";
    }

    return theme
      ? "bg-emerald-500/15 text-emerald-300"
      : "bg-emerald-100 text-emerald-700";
  };

  const stats = [
    {
      label: "Total users",
      value: users.length,
      detail: "Registered customers",
    },
    {
      label: "Total complaints",
      value: complaints.length,
      detail: "All raised tickets",
    },
    {
      label: "Users with complaints",
      value: users.filter((user) => (user?.complaints || []).length > 0).length,
      detail: "Active support cases",
    },
    {
      label: "Complaint-free users",
      value: users.filter((user) => (user?.complaints || []).length === 0)
        .length,
      detail: "No open tickets",
    },
  ];

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
                        Users
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
                    User management
                  </p>
                  <h1 className="text-2xl font-semibold md:text-3xl">
                    Users overview
                  </h1>
                  <p
                    className={`max-w-2xl text-sm leading-6 ${pageTheme.muted}`}
                  >
                    Review registered users and how many complaints are attached
                    to each account.
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                  <h2 className="text-lg font-semibold">Registered users</h2>
                  <p className={`text-sm ${pageTheme.muted}`}>
                    {users.length} user{users.length === 1 ? "" : "s"} loaded
                    from the admin API
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
                          onClick={() => setSearch(item.name)}
                        >
                          {item.name}
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
                        Complaints
                      </th>
                      <th
                        className={`border-b px-5 py-3 font-medium ${pageTheme.border}`}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-10 text-center">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => {
                        const complaintCount = (user?.complaints || []).length;

                        return (
                          <tr
                            key={user?._id || user?.email}
                            className={`transition-colors ${pageTheme.tableRow}`}
                          >
                            <td
                              className={`border-b px-5 py-4 ${pageTheme.border}`}
                            >
                              {user?.name || "-"}
                            </td>
                            <td
                              className={`border-b px-5 py-4 ${pageTheme.border}`}
                            >
                              {user?.email || "-"}
                            </td>
                            <td
                              className={`border-b px-5 py-4 ${pageTheme.border}`}
                            >
                              {complaintCount}
                            </td>
                            <td
                              className={`border-b px-5 py-4 ${pageTheme.border}`}
                            >
                              <span
                                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(complaintCount)}`}
                              >
                                {complaintCount > 0
                                  ? "Has complaints"
                                  : "Clear"}
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
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
