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

  const pageTheme = theme
    ? {
        shell: "bg-slate-950 text-slate-100",
        header: "border-slate-800 bg-slate-950/80",
        border: "border-slate-800",
        muted: "text-slate-400",
        card: "border-slate-800 bg-slate-900/70 text-slate-100",
        cardTitle: "text-slate-50",
        cardText: "text-slate-400",
        button:
          "border-slate-700 text-slate-100 hover:border-slate-500 hover:bg-slate-800",
      }
    : {
        shell: "bg-slate-50 text-slate-900",
        header: "border-slate-200 bg-white/90",
        border: "border-slate-200",
        muted: "text-slate-500",
        card: "border-slate-200 bg-white text-slate-900",
        cardTitle: "text-slate-900",
        cardText: "text-slate-500",
        button:
          "border-slate-300 text-slate-900 hover:border-slate-400 hover:bg-slate-100",
      };

  const toggleTheme = () => {
    setTheme((currentTheme) => !currentTheme);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme);
  }, [theme]);

  return (
    <div className={`${pageTheme.shell} min-h-screen`}>
      <SidebarProvider style={{ backgroundColor: "transparent" }}>
        <AppSidebar />
        <SidebarInset
          className={pageTheme.shell}
          style={{ backgroundColor: "transparent" }}
        >
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
                        Employee dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className={pageTheme.muted}>
                        pending
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

          <main className="flex flex-1 flex-col gap-6 p-4 pt-6">
            <section
              className={`rounded-2xl border p-6 shadow-sm ${pageTheme.card}`}
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl space-y-4">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${pageTheme.muted}`}
                  >
                    <Clock3 className="h-4 w-4" />
                    Waiting queue
                  </div>
                  <div className="space-y-2">
                    <h1
                      className={`text-3xl font-semibold tracking-tight ${pageTheme.cardTitle}`}
                    >
                      Pending tasks
                    </h1>
                    <p className={`max-w-xl leading-7 ${pageTheme.cardText}`}>
                      Keep an eye on tickets that are waiting for assignment,
                      approval, or the next action before work begins.
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
                    Pending task queue
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Awaiting action",
                  body: "Shows tickets that have not started or are waiting on a response.",
                },
                {
                  title: "Queue clarity",
                  body: "Separates upcoming work from active and completed items.",
                },
                {
                  title: "Ready for data",
                  body: "This area can be connected to the live pending-task list next.",
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
