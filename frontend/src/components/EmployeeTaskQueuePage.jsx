import { useState } from "react";
import { Clock3 } from "lucide-react";
import { DashboardShell } from "./DashboardShell";
import { EmployeeAppSidebar as AppSidebar } from "./employee-app-sidebar";
import { useDocumentTheme } from "../hooks/useDocumentTheme";

const pageContent = {
  pending: {
    breadcrumb: "Pending Tasks",
    title: "Pending Tasks",
    description:
      "Keep an eye on assigned work that is waiting for you to begin.",
  },
  "in-progress": {
    breadcrumb: "In Progress Tasks",
    title: "In-progress tasks",
    description:
      "Track tickets that are currently being worked on, monitor ongoing progress, and keep the queue focused on what still needs attention.",
  },
};

export function EmployeeTaskQueuePage({ variant }) {
  const [theme, setTheme] = useState(false);
  const isDarkTheme = theme;
  const content = pageContent[variant] || pageContent.pending;
  const pageTheme = getPageTheme(isDarkTheme);

  useDocumentTheme(isDarkTheme);

  return (
    <DashboardShell
      sidebar={<AppSidebar />}
      sectionLabel="Employee dashboard"
      pageLabel={content.breadcrumb}
      pageTheme={pageTheme}
      isDarkTheme={isDarkTheme}
      onToggleTheme={() => setTheme((currentTheme) => !currentTheme)}
    >
      {variant === "in-progress" ? (
        <InProgressContent content={content} pageTheme={pageTheme} />
      ) : (
        <PendingContent
          content={content}
          pageTheme={pageTheme}
          isDarkTheme={isDarkTheme}
        />
      )}
    </DashboardShell>
  );
}

function PendingContent({ content, pageTheme, isDarkTheme }) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 lg:p-6">
      <section>
        <h1 className="text-2xl font-bold tracking-normal">{content.title}</h1>
        <p className={`mt-1 max-w-2xl text-sm ${pageTheme.muted}`}>
          {content.description}
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
          <div className={`inline-flex items-center gap-2 text-sm ${pageTheme.muted}`}>
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
          <h3 className="mt-4 font-bold">Pending tasks will appear here</h3>
          <p className={`mx-auto mt-2 max-w-md text-sm ${pageTheme.muted}`}>
            This queue is ready to display tasks that have been assigned but
            are not yet in progress.
          </p>
        </div>
      </section>
    </main>
  );
}

function InProgressContent({ content, pageTheme }) {
  const cards = [
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
  ];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 lg:p-6">
      <section className={`rounded-2xl border p-6 shadow-sm ${pageTheme.card}`}>
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
                {content.title}
              </h1>
              <p className={`max-w-xl leading-7 ${pageTheme.cardText}`}>
                {content.description}
              </p>
            </div>
          </div>

          <div className={`rounded-xl border px-4 py-3 text-sm ${pageTheme.border}`}>
            <p className={`font-medium ${pageTheme.cardTitle}`}>Current view</p>
            <p className={`mt-1 ${pageTheme.cardText}`}>Tasks in progress</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((item) => (
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
  );
}

function getPageTheme(isDarkTheme) {
  return isDarkTheme
    ? {
        shell: "bg-slate-950 text-slate-100",
        header: "border-blue-900/60 bg-slate-900",
        border: "border-blue-900/60",
        panel: "border-blue-900/60 bg-slate-900 text-slate-100",
        details: "border-blue-900/60 bg-slate-950/70",
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
        panel: "border-[#b8d8ff] bg-white text-[#001a3a]",
        details: "border-[#b8d8ff] bg-[#eef6ff]",
        muted: "text-[#4e678a]",
        card: "border-[#b8d8ff] bg-[#eef6ff] text-[#12365c] shadow-[0_14px_24px_-20px_rgba(37,99,235,0.95)]",
        cardTitle: "text-[#001a3a]",
        cardText: "text-[#4e678a]",
        button: "border-[#b8d8ff] text-[#12365c] hover:bg-[#eef6ff]",
      };
}
