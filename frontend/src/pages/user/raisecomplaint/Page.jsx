import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
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
import { getRaisedComplaint } from "../../../services/user";
import { useQuery } from "@tanstack/react-query";
import { RaiseComplaintModal } from "../../../components/RaiseComplaintModal";

export default function Page() {
  const [theme, setTheme] = useState(false);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const isDarkTheme = theme;

  const toggleTheme = () => {
    setTheme((prev) => !prev);
  };

  const { data } = useQuery({
    queryKey: ["showRaisedTicked"],
    queryFn: getRaisedComplaint,
  });

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
  const cardHover = isDarkTheme
    ? "hover:shadow-slate-900/50"
    : "hover:shadow-blue-200";
  const cardText = isDarkTheme ? "text-slate-200" : "text-slate-800";
  const cardSubText = isDarkTheme ? "text-slate-400" : "text-slate-600";
  const breadcrumbText = isDarkTheme
    ? "text-slate-400 hover:text-slate-200"
    : "text-slate-600 hover:text-slate-900";

  const complaints = data?.result || [];

  return (
    <div style={pageStyle}>
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
                        className={`text-sm ${breadcrumbText}`}
                        href="#"
                      >
                        Customer Dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className={`text-sm ${breadcrumbText}`}>
                        My Complaints
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
            {/* Header Section */}
            <div className="flex justify-between items-center">
              <div>
                <h1
                  className={`text-2xl font-bold ${isDarkTheme ? "text-slate-100" : "text-slate-900"}`}
                >
                  My Complaints
                </h1>
                <p
                  className={`text-sm mt-1 ${isDarkTheme ? "text-slate-400" : "text-slate-600"}`}
                >
                  Track and manage all your raised complaints
                </p>
              </div>
              <button
                onClick={() => setComplaintModalOpen(true)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  isDarkTheme
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-900/50"
                    : "bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-blue-200"
                }`}
              >
                + Raise New Complaint
              </button>
            </div>

            {/* Complaints Grid */}
            {complaints && complaints.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {complaints.map((ticket) => (
                  <div
                    key={ticket._id}
                    className={`${cardBg} border-2 ${cardBorder} rounded-lg shadow-sm ${cardHover} transition-all hover:shadow-lg p-6 space-y-4`}
                  >
                    {/* Card Header */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h3
                          className={`font-semibold text-lg leading-tight ${cardText}`}
                        >
                          {ticket.subject}
                        </h3>
                        <p className={`text-xs mt-2 ${cardSubText}`}>
                          By: {ticket.name}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          ticket.status === "Pending"
                            ? isDarkTheme
                              ? "bg-amber-900 text-amber-200 border border-amber-700"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                            : ticket.status === "Resolved"
                              ? isDarkTheme
                                ? "bg-green-900 text-green-200 border border-green-700"
                                : "bg-green-100 text-green-800 border border-green-300"
                              : isDarkTheme
                                ? "bg-slate-700 text-slate-200 border border-slate-600"
                                : "bg-slate-200 text-slate-800 border border-slate-300"
                        }`}
                      >
                        {ticket.status === "in_progress" ? <label>In Progress</label> : <label></label>}
                      </span>
                    </div>

                    {/* Divider */}
                    <div
                      className={`h-px ${isDarkTheme ? "bg-slate-700" : "bg-blue-200"}`}
                    ></div>

                    {/* Card Body */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <div>
                          <p
                            className={`text-xs font-medium ${isDarkTheme ? "text-slate-500" : "text-slate-500"}`}
                          >
                            Raised Date
                          </p>
                          <p className={`text-sm mt-1 ${cardText}`}>
                            {new Date(ticket.raisedDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <div>
                          <p
                            className={`text-xs font-medium ${isDarkTheme ? "text-slate-500" : "text-slate-500"}`}
                          >
                            Accepted Date
                          </p>
                          <p className={`text-sm mt-1 ${cardText}`}>
                            {new Date(ticket.acceptedDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p
                          className={`text-xs font-medium ${isDarkTheme ? "text-slate-500" : "text-slate-500"}`}
                        >
                          Description
                        </p>
                        <p
                          className={`text-sm mt-1 leading-relaxed max-h-24 overflow-y-auto ${cardSubText}`}
                        >
                          {ticket.message}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div
                      className={`pt-3 border-t ${isDarkTheme ? "border-slate-700" : "border-blue-200"}`}
                    >
                      <p
                        className={`text-xs ${isDarkTheme ? "text-slate-500" : "text-slate-500"}`}
                      >
                        Ticket ID:{" "}
                        <span className="font-mono text-slate-400">
                          {ticket._id?.slice(-8)}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`${cardBg} border-2 ${cardBorder} rounded-lg p-12 text-center`}
              >
                <div
                  className={`text-4xl mb-3 ${isDarkTheme ? "text-slate-600" : "text-slate-300"}`}
                >
                  📋
                </div>
                <h3 className={`text-lg font-semibold ${cardText}`}>
                  No Complaints Yet
                </h3>
                <p className={`text-sm mt-2 mb-6 ${cardSubText}`}>
                  You haven't raised any complaints. Start by raising a new one!
                </p>
                <button
                  onClick={() => setComplaintModalOpen(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isDarkTheme
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Raise Your First Complaint
                </button>
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>

      <RaiseComplaintModal
        open={complaintModalOpen}
        onOpenChange={setComplaintModalOpen}
        theme={isDarkTheme}
      />
    </div>
  );
}
