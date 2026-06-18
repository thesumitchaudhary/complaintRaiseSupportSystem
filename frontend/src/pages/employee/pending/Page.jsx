import { useEffect, useState } from "react";
import { Clock3, Moon, Sun } from "lucide-react";
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

  const isDarkTheme = theme;
  const pageTheme = isDarkTheme
    ? {
        shell: "bg-slate-950 text-slate-100",
        header: "border-blue-900/60 bg-slate-900",
        panel: "border-blue-900/60 bg-slate-900 text-slate-100",
        details: "border-blue-900/60 bg-slate-950/70",
        muted: "text-slate-400",
        button: "border-blue-900/70 text-slate-100 hover:bg-slate-800",
      }
    : {
        shell: "bg-[#f8fbff] text-[#001a3a]",
        header: "border-[#c7ddff] bg-white",
        panel: "border-[#b8d8ff] bg-white text-[#001a3a]",
        details: "border-[#b8d8ff] bg-[#eef6ff]",
        muted: "text-[#4e678a]",
        button: "border-[#b8d8ff] text-[#12365c] hover:bg-[#eef6ff]",
      };

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
                        Employee dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className={`text-sm ${pageTheme.muted}`}>
                        Pending Tasks
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
            <section>
              <h1 className="text-2xl font-bold tracking-normal">
                Pending Tasks
              </h1>
              <p className={`mt-1 max-w-2xl text-sm ${pageTheme.muted}`}>
                Keep an eye on assigned work that is waiting for you to begin.
              </p>
            </section>

            <section
              className={`overflow-hidden rounded-lg border ${pageTheme.panel}`}
            >
              <div
                className={`flex flex-col gap-2 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${pageTheme.details}`}
              >
                <div>
                  <h2 className="text-lg font-bold">Pending Task Queue</h2>
                  <p className={`mt-1 text-sm ${pageTheme.muted}`}>
                    Tasks assigned to you will appear here before work starts.
                  </p>
                </div>
                <div
                  className={`inline-flex items-center gap-2 text-sm ${pageTheme.muted}`}
                >
                  <Clock3 className="h-4 w-4" />
                  Waiting queue
                </div>
              </div>

              <div className="px-5 py-14 text-center">
                <div
                  className={`mx-auto flex h-12 w-12 items-center justify-center rounded-lg border ${pageTheme.details}`}
                >
                  <Clock3
                    className={`h-6 w-6 ${
                      isDarkTheme ? "text-orange-300" : "text-orange-500"
                    }`}
                  />
                </div>
                <h3 className="mt-4 font-bold">
                  Pending tasks will appear here
                </h3>
                <p
                  className={`mx-auto mt-2 max-w-md text-sm ${pageTheme.muted}`}
                >
                  This queue is ready to display tasks that have been assigned
                  but are not yet in progress.
                </p>
              </div>
            </section>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
