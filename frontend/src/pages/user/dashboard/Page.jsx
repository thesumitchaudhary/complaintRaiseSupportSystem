import { useState, useEffect } from "react";
import { Moon, Sun, Search } from "lucide-react";
import { AppSidebar } from "../../../components/app-sidebar";
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
import { showloggedinuser } from "../../../services/index";
import { getRaisedComplaint } from "../../../services/user";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const [theme, setTheme] = useState(false);
  const isDarkTheme = theme;

  // this is for the debouncing
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const toggleTheme = () => {
    setTheme((prev) => !prev);
  };

  const { data } = useQuery({
    queryKey: ["showRaisedTicket", debouncedSearch],
    queryFn: () => getRaisedComplaint(debouncedSearch),
  });

  const { data: UserData } = useQuery({
    queryKey: ["showloginuser"],
    queryFn: showloggedinuser,
  });

  // Calculate stats from data
  const complaints = data?.result || [];
  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(
    (c) => c.status === "resolved",
  ).length;
  const pendingComplaints = complaints.filter(
    (c) => c.status === "pending",
  ).length;

  // Theme constants
  const pageStyle = {
    minHeight: "100vh",
    backgroundColor: isDarkTheme ? "#0f172a" : "#f8fafc",
    color: isDarkTheme ? "#f1f5f9" : "#1e293b",
  };

  const headerStyle = {
    backgroundColor: isDarkTheme ? "#1e293b" : "#ffffff",
  };

  const cardBg = isDarkTheme ? "bg-slate-800" : "bg-blue-50";
  const cardBorder = isDarkTheme ? "border-slate-700" : "border-blue-200";
  const tableBg = isDarkTheme ? "bg-slate-800" : "bg-white";
  const tableHeaderBg = isDarkTheme ? "bg-slate-900" : "bg-slate-50";
  const tableRowHover = isDarkTheme
    ? "hover:bg-slate-700"
    : "hover:bg-slate-100";
  const tableText = isDarkTheme ? "text-slate-200" : "text-slate-800";
  const tableHeaderText = isDarkTheme ? "text-slate-300" : "text-slate-900";

  const filteredComplaints = complaints.filter((ticket) => {
    ticket.subject.toLowerCase().includes(debouncedSearch.toLowerCase());
  });

  const suggestions = complaints.filter((ticket) =>
    ticket.subject.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className={isDarkTheme ? "dark" : ""} style={pageStyle}>
      <SidebarProvider style={{ backgroundColor: pageStyle.backgroundColor }}>
        <AppSidebar />
        <SidebarInset style={{ backgroundColor: pageStyle.backgroundColor }}>
          <header
            className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b"
            style={headerStyle}
          >
            <div className="flex items-center gap-2 px-4 w-full justify-between">
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
                        className={`text-sm ${
                          isDarkTheme
                            ? "text-slate-400 hover:text-slate-200"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                        href="#"
                      >
                        Customer Dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage
                        className={`text-sm ${
                          isDarkTheme
                            ? "text-slate-400 hover:text-slate-200"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Overview
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <button
                className={`border-2 p-1 rounded-md transition-all ${
                  isDarkTheme
                    ? "text-slate-200 border-slate-600 hover:bg-slate-700"
                    : "text-slate-800 border-slate-400 hover:bg-slate-200"
                }`}
                onClick={toggleTheme}
              >
                {isDarkTheme ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6 p-6">
            {/* Stats Cards */}
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold">Dashboard</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div
                className={`${cardBg} border-2 ${cardBorder} rounded-lg p-6 transition-all hover:shadow-lg`}
              >
                <p
                  className={`text-sm font-medium ${isDarkTheme ? "text-slate-400" : "text-slate-600"}`}
                >
                  Total Complaints
                </p>

                <p
                  className={`text-3xl font-bold mt-2 ${isDarkTheme ? "text-blue-400" : "text-blue-600"}`}
                >
                  {totalComplaints}
                </p>
                <p
                  className={`text-xs mt-3 ${isDarkTheme ? "text-slate-500" : "text-slate-500"}`}
                >
                  All raised complaints
                </p>
              </div>

              <div
                className={`${cardBg} border-2 ${cardBorder} rounded-lg p-6 transition-all hover:shadow-lg`}
              >
                <p
                  className={`text-sm font-medium ${isDarkTheme ? "text-slate-400" : "text-slate-600"}`}
                >
                  Resolved
                </p>
                <p
                  className={`text-3xl font-bold mt-2 ${isDarkTheme ? "text-green-400" : "text-green-600"}`}
                >
                  {resolvedComplaints}
                </p>
                <p
                  className={`text-xs mt-3 ${isDarkTheme ? "text-slate-500" : "text-slate-500"}`}
                >
                  Completed complaints
                </p>
              </div>

              <div
                className={`${cardBg} border-2 ${cardBorder} rounded-lg p-6 transition-all hover:shadow-lg`}
              >
                <p
                  className={`text-sm font-medium ${isDarkTheme ? "text-slate-400" : "text-slate-600"}`}
                >
                  Resolved
                </p>
                <p
                  className={`text-3xl font-bold mt-2 ${isDarkTheme ? "text-green-400" : "text-green-600"}`}
                >
                  {resolvedComplaints}
                </p>
                <p
                  className={`text-xs mt-3 ${isDarkTheme ? "text-slate-500" : "text-slate-500"}`}
                >
                  Completed complaints
                </p>
              </div>

              <div
                className={`${cardBg} border-2 ${cardBorder} rounded-lg p-6 transition-all hover:shadow-lg`}
              >
                <p
                  className={`text-sm font-medium ${isDarkTheme ? "text-slate-400" : "text-slate-600"}`}
                >
                  Pending
                </p>
                <p
                  className={`text-3xl font-bold mt-2 ${isDarkTheme ? "text-amber-400" : "text-amber-600"}`}
                >
                  {pendingComplaints}
                </p>
                <p
                  className={`text-xs mt-3 ${isDarkTheme ? "text-slate-500" : "text-slate-500"}`}
                >
                  Waiting for resolution
                </p>
              </div>
            </div>

            {/* Complaints Table */}
            <div
              className={`${tableBg} rounded-lg border-2 ${cardBorder} overflow-hidden`}
            >
              <div
                className={`${tableHeaderBg} px-6 py-4 border-b ${cardBorder}`}
              >
                <h2 className={`text-lg font-semibold ${tableHeaderText}`}>
                  Your Complaints
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`${tableHeaderBg} border-b ${cardBorder}`}>
                      <th
                        className={`px-6 py-3 text-left font-semibold text-sm ${tableHeaderText}`}
                      >
                        Name
                      </th>
                      <th
                        className={`px-6 py-3 text-left font-semibold text-sm ${tableHeaderText}`}
                      >
                        Email
                      </th>
                      <th
                        className={`px-6 py-3 text-left font-semibold text-sm ${tableHeaderText}`}
                      >
                        Subject
                      </th>
                      <th
                        className={`px-6 py-3 text-left font-semibold text-sm ${tableHeaderText}`}
                      >
                        Message
                      </th>
                      <th
                        className={`px-6 py-3 text-left font-semibold text-sm ${tableHeaderText}`}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints && complaints.length > 0 ? (
                      complaints.map((complaint, index) => (
                        <tr
                          key={index}
                          className={`border-b ${cardBorder} ${tableRowHover} transition-colors`}
                        >
                          <td className={`px-6 py-4 text-sm ${tableText}`}>
                            {UserData?.result?.name}
                          </td>
                          <td className={`px-6 py-4 text-sm ${tableText}`}>
                            {UserData?.result?.email}
                          </td>
                          <td className={`px-6 py-4 text-sm ${tableText}`}>
                            {complaint.subject}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm ${tableText} truncate max-w-xs`}
                          >
                            {complaint.message}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                complaint.status === "resolved"
                                  ? isDarkTheme
                                    ? "bg-green-900 text-green-200"
                                    : "bg-green-100 text-green-800"
                                  : complaint.status === "pending"
                                    ? isDarkTheme
                                      ? "bg-amber-900 text-amber-200"
                                      : "bg-amber-100 text-amber-800"
                                    : isDarkTheme
                                      ? "bg-blue-900 text-blue-200"
                                      : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {complaint.status.charAt(0).toUpperCase() +
                                complaint.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className={`px-6 py-12 text-center text-sm ${
                            isDarkTheme ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          No complaints found. You're all caught up! 🎉
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
