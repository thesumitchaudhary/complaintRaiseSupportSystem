import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { EmployeeAppSidebar as AppSidebar } from "../../../components/employee-app-sidebar";
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

export default function Page() {
  const [theme, setTheme] = useState(false);

  const toggleTheme = () => {
    setTheme(!theme);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme);
  }, [theme]);

  return (
    <div
      className={theme ? "dark bg-black text-white" : "bg-white text-black"}
      style={{
        minHeight: "100vh",
        backgroundColor: theme ? "#000000" : "#ffffff",
        color: theme ? "#ffffff" : "#000000",
      }}
    >
      <SidebarProvider style={{ backgroundColor: "transparent" }}>
        <AppSidebar />
        <SidebarInset
          className={theme ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}
          style={{ backgroundColor: "transparent" }}
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
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0"></div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
