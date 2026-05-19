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
import {  getRaisedComplaint } from "../../../services/user";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const [theme, setTheme] = useState(false);

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

  const { data } = useQuery({
    queryKey: ["showRaisedTicked"],
    queryFn: getRaisedComplaint,
  });

  return (
    <div
      className={theme ? "dark bg-black text-white" : "bg-white text-black"}
      style={{
        minHeight: "100vh",
        backgroundColor: theme ? "#000000" : "#ffffff",
        color: theme ? "#ffffff" : "#000000",
      }}
    >
      <SidebarProvider
        style={{ backgroundColor: theme ? "#000000" : "#ffffff" }}
      >
        <AppSidebar />
        <SidebarInset
          style={{ backgroundColor: theme ? "#000000" : "#ffffff" }}
        >
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink
                      className={`${theme ? "text-gray-400 hover:text-gray-100" : "text-gray-400 hover:text-black"}`}
                      href="#"
                    >
                      Customer dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage
                      className={`${theme ? "text-gray-400 hover:text-gray-100" : "text-gray-400 hover:text-black"}`}
                    >
                      Overview
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      <button
                        className={`border-2 p-1 rounded-md  ${theme ? "text-white border-white" : "text-black border-black hover:bg-gray-200 hover:border-gray-300"}`}
                        onClick={toggleTheme}
                      >
                        {theme ? <Moon /> : <Sun />}
                      </button>
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex justify-between">
              <div>All Complaints</div>
              <button>Raise New Complaint</button>
            </div>
            <div className="flex gap-5 flex-wrap">
              <article className="border-black border-3">
                <h4>subject</h4>
                <p>message</p>
                <p>status</p>
                <div className="flex gap-3">
                  <span className="text-xs">Raised Date</span>
                  <span className="text-xs">accepted Date</span>
                  <span className="text-xs">start Date</span>
                </div>
              </article>
              <article className="border-black border-3">
                <h4>subject</h4>
                <p>message</p>
                <p>status</p>
                <div className="flex gap-3">
                  <span className="text-xs">Raised Date</span>
                  <span className="text-xs">accepted Date</span>
                  <span className="text-xs">start Date</span>
                </div>
              </article>
              <article className="border-black border-3">
                <h4>subject</h4>
                <p>message</p>
                <p>status</p>
                <div className="flex gap-3">
                  <span className="text-xs">Raised Date</span>
                  <span className="text-xs">accepted Date</span>
                  <span className="text-xs">start Date</span>
                </div>
              </article>
              <article className="border-black border-3">
                <h4>subject</h4>
                <p>message</p>
                <p>status</p>
                <div className="flex gap-3">
                  <span className="text-xs">Raised Date</span>
                  <span className="text-xs">accepted Date</span>
                  <span className="text-xs">start Date</span>
                </div>
              </article>
              <article className="border-black border-3">
                <h4>subject</h4>
                <p>message</p>
                <p>status</p>
                <div className="flex gap-3">
                  <span className="text-xs">Raised Date</span>
                  <span className="text-xs">accepted Date</span>
                  <span className="text-xs">start Date</span>
                </div>
              </article>
              <article className="border-black border-3">
                <h4>subject</h4>
                <p>message</p>
                <p>status</p>
                <div className="flex gap-3">
                  <span className="text-xs">Raised Date</span>
                  <span className="text-xs">accepted Date</span>
                  <span className="text-xs">start Date</span>
                </div>
              </article>
              <article className="border-black border-3">
                <h4>subject</h4>
                <p>message</p>
                <p>status</p>
                <div className="flex gap-3">
                  <span className="text-xs">Raised Date</span>
                  <span className="text-xs">accepted Date</span>
                  <span className="text-xs">start Date</span>
                </div>
              </article>
              <article className="border-black border-3">
                <h4>subject</h4>
                <p>message</p>
                <p>status</p>
                <div className="flex gap-3">
                  <span className="text-xs">Raised Date</span>
                  <span className="text-xs">accepted Date</span>
                  <span className="text-xs">start Date</span>
                </div>
              </article>
              <article className="border-black border-3">
                <h4>subject</h4>
                <p>message</p>
                <p>status</p>
                <div className="flex gap-3">
                  <span className="text-xs">Raised Date</span>
                  <span className="text-xs">accepted Date</span>
                  <span className="text-xs">start Date</span>
                </div>
              </article>
              <article className="border-black border-3">
                <h4>subject</h4>
                <p>message</p>
                <p>status</p>
                <div className="flex gap-3">
                  <span className="text-xs">Raised Date</span>
                  <span className="text-xs">accepted Date</span>
                  <span className="text-xs">start Date</span>
                </div>
              </article>
              <article className="border-black border-3">
                <h4>subject</h4>
                <p>message</p>
                <p>status</p>
                <div className="flex gap-3">
                  <span className="text-xs">Raised Date</span>
                  <span className="text-xs">accepted Date</span>
                  <span className="text-xs">start Date</span>
                </div>
              </article>
              <article className="border-black border-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data?.result?.map((ticket) => (
                    <div
                      key={ticket._id}
                      className={`rounded-lg shadow-sm hover:shadow-lg transition p-6 ${cardThemeClasses}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg mb-1">
                            {ticket.subject}
                          </h4>
                          <p className="text-sm opacity-80">
                            complaintPerson: {ticket.name}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            ticket.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : ticket.status === "Resolved"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed whitespace-pre-line opacity-90">
                        {ticket.message}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
