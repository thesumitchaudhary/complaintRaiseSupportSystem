import { useEffect, useState } from "react";
import { Moon, Search, Sun } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
import { showUser } from "../../../services/admin";
import { getRaisedComplaint } from "../../../services/user";

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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const isDarkTheme = theme;

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

  const { data: complaintData } = useQuery({
    queryKey: ["showRaisedTicked"],
    queryFn: getRaisedComplaint,
  });

  const { data: userData, isLoading: isUsersLoading } = useQuery({
    queryKey: ["showUserToAdmin", debouncedSearch],
    queryFn: () => showUser(debouncedSearch),
  });

  const users = Array.isArray(userData?.result) ? userData.result : [];
  const complaints = Array.isArray(complaintData?.result)
    ? complaintData.result
    : [];

  const filteredUsers = users.filter((user) =>
    (user?.name || "").toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  const suggestions = search.trim()
    ? users
        .filter((user) =>
          (user?.name || "").toLowerCase().includes(search.toLowerCase()),
        )
        .slice(0, 5)
    : [];

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

  const getStatusBadgeClass = (count) => {
    if (count > 0) {
      return isDarkTheme
        ? "bg-amber-950 text-amber-200"
        : "bg-amber-100 text-amber-700";
    }

    return isDarkTheme
      ? "bg-emerald-950 text-emerald-200"
      : "bg-emerald-100 text-emerald-700";
  };

  const stats = [
    {
      label: "Total Users",
      value: users.length,
      detail: "Registered customers",
      accent: isDarkTheme ? "text-blue-300" : "text-blue-600",
    },
    {
      label: "Total Complaints",
      value: complaints.length,
      detail: "All raised tickets",
      accent: isDarkTheme ? "text-violet-300" : "text-blue-600",
    },
    {
      label: "Users With Complaints",
      value: users.filter((user) => (user?.complaints || []).length > 0).length,
      detail: "Active support cases",
      accent: isDarkTheme ? "text-orange-300" : "text-orange-500",
    },
    {
      label: "Complaint-free Users",
      value: users.filter((user) => (user?.complaints || []).length === 0)
        .length,
      detail: "No open tickets",
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
                        Admin dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className={`text-sm ${pageTheme.muted}`}>
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
                  Users Overview
                </h1>
                <p className={`mt-1 max-w-2xl text-sm ${pageTheme.muted}`}>
                  Review registered users and how many complaints are attached
                  to each account.
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
                  placeholder="Search registered users"
                  className={`h-12 w-full rounded-none border py-2 pl-12 pr-4 text-sm outline-none transition-colors focus-visible:ring-2 ${pageTheme.field}`}
                />

                {suggestions.length > 0 ? (
                  <div
                    className={`absolute left-0 top-full z-50 mt-1 w-full overflow-hidden border shadow-lg ${pageTheme.panel}`}
                  >
                    {suggestions.map((item) => (
                      <button
                        key={item?._id || item?.email}
                        type="button"
                        className={`block w-full px-4 py-3 text-left text-sm transition-colors ${pageTheme.suggestionHover}`}
                        onClick={() => setSearch(item?.name || "")}
                      >
                        <span className="font-medium">{item?.name || "-"}</span>
                        <span className={`ml-2 ${pageTheme.muted}`}>
                          {item?.email || ""}
                        </span>
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
                    <h2 className="text-lg font-bold">Registered Users</h2>
                    <p className={`mt-1 text-sm ${pageTheme.muted}`}>
                      View customer details and their current complaint status.
                    </p>
                  </div>
                  <p className={`text-sm ${pageTheme.muted}`}>
                    {isUsersLoading
                      ? "Loading users"
                      : `${filteredUsers.length} of ${users.length} shown`}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-separate border-spacing-0 text-left text-sm">
                  <thead className={pageTheme.tableHead}>
                    <tr>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Name
                      </th>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Email
                      </th>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Complaints
                      </th>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Join Date
                      </th>
                      <th className="border-b border-inherit px-5 py-4 font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {isUsersLoading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className={`px-5 py-12 text-center ${pageTheme.muted}`}
                        >
                          Loading registered users...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className={`px-5 py-12 text-center ${pageTheme.muted}`}
                        >
                          {search
                            ? "No registered users match your search."
                            : "No registered users found."}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const complaintCount = (user?.complaints || []).length;

                        return (
                          <tr
                            key={user?._id || user?.email}
                            className={`transition-colors ${pageTheme.tableRow}`}
                          >
                            <td className="border-b border-inherit px-5 py-4 font-medium">
                              {user?.name || "-"}
                            </td>
                            <td className="border-b border-inherit px-5 py-4">
                              {user?.email || "-"}
                            </td>
                            <td className="border-b border-inherit px-5 py-4">
                              {complaintCount}
                            </td>
                            <td className="whitespace-nowrap border-b border-inherit px-5 py-4">
                              {formatDate(user?.createdAt)}
                            </td>
                            <td className="border-b border-inherit px-5 py-4">
                              <span
                                className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(complaintCount)}`}
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
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
