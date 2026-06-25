import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "../../../components/admin-app-sidebar";
import { DashboardShell } from "../../../components/DashboardShell";
import { DataTable } from "../../../components/DataTable";
import { HighlightedText } from "../../../components/HighlightedText";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useDocumentTheme } from "../../../hooks/useDocumentTheme";
import { formatDate } from "../../../lib/complaints";
import { showUser } from "../../../services/admin";
import { getRaisedComplaint } from "../../../services/user";

const getStatusBadgeClass = (count, isDarkTheme) => {
  if (count > 0) {
    return isDarkTheme
      ? "bg-amber-950 text-amber-200"
      : "bg-amber-100 text-amber-700";
  }

  return isDarkTheme
    ? "bg-emerald-950 text-emerald-200"
    : "bg-emerald-100 text-emerald-700";
};

const renderHighlightedText = (value, searchTerm, highlightClassName) => {
  return (
    <HighlightedText
      value={value}
      searchTerm={searchTerm}
      className={highlightClassName}
    />
  );
};

const USER_PAGE_SIZE = 5;

export default function Page() {
  const [theme, setTheme] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);
  const isDarkTheme = theme;

  useDocumentTheme(isDarkTheme);

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

  const filteredUserCount = filteredUsers.length;
  const totalPages = Math.max(Math.ceil(filteredUserCount / USER_PAGE_SIZE), 1);
  const activePage = Math.min(currentPage, totalPages);
  const paginatedUsers = useMemo(() => {
    const pageStart = (activePage - 1) * USER_PAGE_SIZE;

    return filteredUsers.slice(pageStart, pageStart + USER_PAGE_SIZE);
  }, [activePage, filteredUsers]);
  const firstShownUser =
    filteredUserCount > 0 ? (activePage - 1) * USER_PAGE_SIZE + 1 : 0;
  const lastShownUser = Math.min(
    activePage * USER_PAGE_SIZE,
    filteredUserCount,
  );

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
        highlight: "bg-yellow-300/30 text-yellow-100",
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
        highlight: "bg-yellow-200 text-[#001a3a]",
      };

  const userColumns = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        cellClassName: "font-medium",
        render: (user) =>
          renderHighlightedText(
            user?.name || "-",
            debouncedSearch,
            pageTheme.highlight,
          ),
      },
      {
        key: "email",
        header: "Email",
        render: (user) =>
          renderHighlightedText(
            user?.email || "-",
            debouncedSearch,
            pageTheme.highlight,
          ),
      },
      {
        key: "complaints",
        header: "Complaints",
        render: (user) => (user?.complaints || []).length,
      },
      {
        key: "joinDate",
        header: "Join Date",
        cellClassName: "whitespace-nowrap",
        render: (user) =>
          renderHighlightedText(
            formatDate(user?.createdAt),
            debouncedSearch,
            pageTheme.highlight,
          ),
      },
      {
        key: "status",
        header: "Status",
        render: (user) => {
          const complaintCount = (user?.complaints || []).length;

          return (
            <span
              className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                complaintCount,
                isDarkTheme,
              )}`}
            >
              {renderHighlightedText(
                complaintCount > 0 ? "Has complaints" : "Clear",
                debouncedSearch,
                pageTheme.highlight,
              )}
            </span>
          );
        },
      },
    ],
    [debouncedSearch, isDarkTheme, pageTheme.highlight],
  );

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
    <DashboardShell
      sidebar={<AppSidebar />}
      sectionLabel="Admin dashboard"
      pageLabel="Users"
      pageTheme={pageTheme}
      isDarkTheme={isDarkTheme}
      onToggleTheme={() => setTheme((currentTheme) => !currentTheme)}
    >
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 lg:p-6">
        <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-normal">
              Users Overview
            </h1>
            <p className={`mt-1 max-w-2xl text-sm ${pageTheme.muted}`}>
              Review registered users and how many complaints are attached to
              each account.
            </p>
          </div>

          <div className="relative w-full xl:w-[30rem]">
            <Search
              className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${pageTheme.muted}`}
            />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
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
                    onClick={() => {
                      setSearch(item?.name || "");
                      setCurrentPage(1);
                    }}
                  >
                    <span className="font-medium">
                      {renderHighlightedText(
                        item?.name || "-",
                        search,
                        pageTheme.highlight,
                      )}
                    </span>
                    <span className={`ml-2 ${pageTheme.muted}`}>
                      {renderHighlightedText(
                        item?.email || "",
                        search,
                        pageTheme.highlight,
                      )}
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
          <div className={`border-b px-4 py-4 sm:px-5 ${pageTheme.divider}`}>
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
                  : `${firstShownUser}-${lastShownUser} of ${filteredUserCount} shown`}
              </p>
            </div>
          </div>

          <div className="md:hidden">
            {isUsersLoading || filteredUserCount === 0 ? (
              <p
                className={`px-4 py-12 text-center ${pageTheme.muted}`}
                role="status"
              >
                {isUsersLoading
                  ? "Loading registered users..."
                  : search
                    ? "No registered users match your search."
                    : "No registered users found."}
              </p>
            ) : (
              <ul aria-label="Registered users" className="divide-y">
                {paginatedUsers.map((user, index) => {
                  const complaintCount = (user?.complaints || []).length;

                  return (
                    <li
                      key={user?._id || user?.email || index}
                      className={pageTheme.divider}
                    >
                      <article className="space-y-4 p-4">
                        <header className="min-w-0">
                          <h3 className="truncate font-semibold">
                            {renderHighlightedText(
                              user?.name || "-",
                              debouncedSearch,
                              pageTheme.highlight,
                            )}
                          </h3>
                          {user?.email ? (
                            <a
                              href={`mailto:${user.email}`}
                              className={`block break-all text-sm ${pageTheme.muted}`}
                            >
                              {renderHighlightedText(
                                user.email,
                                debouncedSearch,
                                pageTheme.highlight,
                              )}
                            </a>
                          ) : (
                            <p
                              className={`break-all text-sm ${pageTheme.muted}`}
                            >
                              -
                            </p>
                          )}
                        </header>

                        <dl className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <dt className={pageTheme.muted}>Complaints</dt>
                            <dd className="mt-1 font-semibold">
                              {complaintCount}
                            </dd>
                          </div>
                          <div>
                            <dt className={pageTheme.muted}>Join date</dt>
                            <dd className="mt-1 font-medium">
                              {renderHighlightedText(
                                formatDate(user?.createdAt),
                                debouncedSearch,
                                pageTheme.highlight,
                              )}
                            </dd>
                          </div>
                        </dl>

                        <span
                          className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                            complaintCount,
                            isDarkTheme,
                          )}`}
                        >
                          {renderHighlightedText(
                            complaintCount > 0 ? "Has complaints" : "Clear",
                            debouncedSearch,
                            pageTheme.highlight,
                          )}
                        </span>
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <DataTable
              columns={userColumns}
              data={paginatedUsers}
              getRowKey={(user, index) => user?._id || user?.email || index}
              isLoading={isUsersLoading}
              loadingMessage="Loading registered users..."
              emptyMessage={
                search
                  ? "No registered users match your search."
                  : "No registered users found."
              }
              tableClassName="min-w-[860px] border-separate border-spacing-0 text-left text-sm"
              headerClassName={pageTheme.tableHead}
              headerCellClassName="border-b border-inherit px-5 py-4 font-semibold"
              rowClassName={`transition-colors ${pageTheme.tableRow}`}
              cellClassName="border-b border-inherit px-5 py-4"
              emptyClassName={`px-5 py-12 ${pageTheme.muted}`}
            />
          </div>

          {!isUsersLoading && filteredUserCount > 0 ? (
            <nav
              className={`flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${pageTheme.divider}`}
              aria-label="Registered users pagination"
            >
              <span className={`text-sm ${pageTheme.muted}`}>
                {USER_PAGE_SIZE} users per page
              </span>

              <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                <span
                  className={`text-sm ${pageTheme.muted}`}
                  aria-live="polite"
                >
                  Page {activePage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={activePage <= 1}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.max(Math.min(page, totalPages) - 1, 1),
                      )
                    }
                    className={`inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${pageTheme.button}`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={activePage >= totalPages}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(page + 1, totalPages))
                    }
                    className={`inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${pageTheme.button}`}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </nav>
          ) : null}
        </section>
      </main>
    </DashboardShell>
  );
}
