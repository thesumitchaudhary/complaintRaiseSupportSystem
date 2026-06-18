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
        border: "border-blue-900/60",
        muted: "text-slate-400",
        card: "border-blue-900/70 bg-slate-900 text-slate-100",
        cardTitle: "text-slate-50",
        cardText: "text-slate-400",
        button: "border-blue-900/70 text-slate-100 hover:bg-slate-800",
      }
    : {
        shell: "bg-[#f8fbff] text-[#001a3a]",
        header: "border-[#c7ddff] bg-white",
        border: "border-[#b8d8ff]",
        muted: "text-[#4e678a]",
        card: "border-[#b8d8ff] bg-[#eef6ff] text-[#12365c] shadow-[0_14px_24px_-20px_rgba(37,99,235,0.95)]",
        cardTitle: "text-[#001a3a]",
        cardText: "text-[#4e678a]",
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
                        In Progress Tasks
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
            <section
              className={`rounded-2xl border p-6 shadow-sm ${pageTheme.card}`}
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl space-y-4">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${pageTheme.muted}`}
                  >
                    <Clock3 className="h-4 w-4" />
                    Active work
                  </div>
                  <div className="space-y-2">
                    <h1
                      className={`text-3xl font-semibold tracking-tight ${pageTheme.cardTitle}`}
                    >
                      In-progress tasks
                    </h1>
                    <p className={`max-w-xl leading-7 ${pageTheme.cardText}`}>
                      Track tickets that are currently being worked on, monitor
                      ongoing progress, and keep the queue focused on what still
                      needs attention.
                    </p>
                  </div>
                </div>

                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${pageTheme.border}`}
                >
                  <p className={`font-medium ${pageTheme.cardTitle}`}>
                    Current view
                  </p>
                  <p className={`mt-1 ${pageTheme.cardText}`}>
                    Tasks in progress
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Work in motion",
                  body: "Shows tasks that still need updates, follow-through, or completion.",
                },
                {
                  title: "Clear focus",
                  body: "Keeps active tickets separated from pending and finished work.",
                },
                {
                  title: "Ready for data",
                  body: "This section can be connected to your live in-progress task list next.",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className={`rounded-xl border p-4 shadow-sm ${pageTheme.card}`}
                >
                  <h2
                    className={`text-sm font-semibold uppercase tracking-wide ${pageTheme.cardTitle}`}
                  >
                    {item.title}
                  </h2>
                  <p className={`mt-2 text-sm leading-6 ${pageTheme.cardText}`}>
                    {item.body}
                  </p>
                </article>
              ))}
            </section>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
