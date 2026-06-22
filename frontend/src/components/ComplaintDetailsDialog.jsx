import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

const formatLabel = (value) => {
  if (!value) return "-";

  return String(value)
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

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

const getStatusClasses = (status, isDarkTheme) => {
  const normalizedStatus = String(status || "").toLowerCase();

  if (["completed", "resolved"].includes(normalizedStatus)) {
    return isDarkTheme
      ? "border-emerald-700 bg-emerald-950 text-emerald-200"
      : "border-transparent bg-emerald-100 text-emerald-700";
  }

  if (normalizedStatus === "pending") {
    return isDarkTheme
      ? "border-amber-700 bg-amber-950 text-amber-200"
      : "border-transparent bg-orange-100 text-orange-600";
  }

  if (["assigned", "in_progress"].includes(normalizedStatus)) {
    return isDarkTheme
      ? "border-sky-700 bg-sky-950 text-sky-200"
      : "border-transparent bg-blue-100 text-blue-700";
  }

  if (normalizedStatus === "rejected") {
    return isDarkTheme
      ? "border-red-700 bg-red-950 text-red-200"
      : "border-transparent bg-red-100 text-red-700";
  }

  return isDarkTheme
    ? "border-slate-700 bg-slate-900 text-slate-200"
    : "border-transparent bg-blue-100 text-blue-700";
};

export const ComplaintDetailsDialog = ({
  complaint,
  currentUser,
  isDarkTheme,
  onOpenChange,
}) => {
  const detailTheme = isDarkTheme
    ? {
        overlay: "bg-slate-950/70",
        modal: "border-blue-900/70 bg-slate-900 text-slate-100",
        header: "border-blue-900/60 bg-slate-950/90",
        body: "bg-slate-900",
        surface: "border-blue-900/60 bg-slate-950/60",
        surfaceAlt: "border-blue-900/50 bg-slate-900/80",
        label: "text-slate-400",
        muted: "text-slate-300",
        close: "border-blue-900/70 text-slate-100 hover:bg-slate-800",
        scrollbarStyle: {
          "--complaint-scroll-thumb": "#3b82f6",
          "--complaint-scroll-track": "#0f172a",
          "--complaint-scroll-thumb-hover": "#60a5fa",
        },
      }
    : {
        overlay: "bg-[#001a3a]/35",
        modal: "border-[#b8d8ff] bg-white text-[#001a3a]",
        header: "border-[#c7ddff] bg-[#f8fbff]",
        body: "bg-white",
        surface: "border-[#c7ddff] bg-[#f8fbff]",
        surfaceAlt: "border-[#b8d8ff] bg-[#eef6ff]",
        label: "text-[#4e678a]",
        muted: "text-[#4e678a]",
        close: "border-[#b8d8ff] text-[#12365c] hover:bg-[#eef6ff]",
        scrollbarStyle: {
          "--complaint-scroll-thumb": "#2563eb",
          "--complaint-scroll-track": "#dbeafe",
          "--complaint-scroll-thumb-hover": "#1d4ed8",
        },
      };

  return (
    <DialogPrimitive.Root open={Boolean(complaint)} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={`fixed inset-0 z-50 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 ${detailTheme.overlay}`}
        />
        <DialogPrimitive.Content
          className={`fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border shadow-2xl outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 ${detailTheme.modal}`}
        >
          <DialogPrimitive.Close asChild>
            <button
              type="button"
              aria-label="Close complaint details"
              className={`absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${detailTheme.close}`}
            >
              <X className="h-4 w-4" />
            </button>
          </DialogPrimitive.Close>

          <div className={`border-b px-6 py-5 ${detailTheme.header}`}>
            <div className="flex items-start justify-between gap-4 pr-10">
              <div>
                <DialogPrimitive.Title className="text-xl font-bold">
                  Complaint Details
                </DialogPrimitive.Title>
                <DialogPrimitive.Description
                  className={`text-sm ${detailTheme.muted}`}
                >
                  Full information for the selected complaint.
                </DialogPrimitive.Description>
              </div>

              {complaint ? (
                <span
                  className={`inline-flex rounded-md border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                    complaint.status,
                    isDarkTheme,
                  )}`}
                >
                  {formatLabel(complaint.status || "pending")}
                </span>
              ) : null}
            </div>
          </div>

          {complaint ? (
            <div
              className={`complaint-details-scrollbar space-y-5 overflow-y-auto px-6 py-5 ${detailTheme.body}`}
              style={detailTheme.scrollbarStyle}
            >
              <section
                className={`rounded-lg border p-4 ${detailTheme.surface}`}
              >
                <p
                  className={`text-xs font-semibold uppercase ${detailTheme.label}`}
                >
                  Subject
                </p>
                <h3 className="mt-2 text-lg font-bold">
                  {complaint.subject || "Untitled complaint"}
                </h3>
                <p className={`mt-2 text-sm ${detailTheme.muted}`}>
                  Ticket ID: {complaint._id || "-"}
                </p>
              </section>

              <section className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    label: "Name",
                    value: complaint.name || currentUser?.name || "-",
                  },
                  {
                    label: "Email",
                    value: complaint.email || currentUser?.email || "-",
                  },
                  {
                    label: "Service Type",
                    value: formatLabel(complaint.serviceType),
                  },
                  {
                    label: "Priority",
                    value: formatLabel(complaint.priority || "medium"),
                  },
                  {
                    label: "Raised Date",
                    value: formatDate(
                      complaint.raisedDate || complaint.createdAt,
                    ),
                  },
                  {
                    label: "Assigned Date",
                    value: formatDate(complaint.assignedDate),
                  },
                  {
                    label: "Due Date",
                    value: formatDate(complaint.deadline),
                  },
                  {
                    label: "Completed Date",
                    value: formatDate(complaint.completedDate),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-lg border p-3 ${detailTheme.surfaceAlt}`}
                  >
                    <p
                      className={`text-xs font-semibold uppercase ${detailTheme.label}`}
                    >
                      {item.label}
                    </p>
                    <p className="mt-1 break-words font-medium">{item.value}</p>
                  </div>
                ))}
              </section>

              {complaint.task?.title || complaint.task?.notes ? (
                <section
                  className={`rounded-lg border p-4 ${detailTheme.surfaceAlt}`}
                >
                  <p
                    className={`text-xs font-semibold uppercase ${detailTheme.label}`}
                  >
                    Assigned Task
                  </p>
                  <p className="mt-2 font-semibold">
                    {complaint.task?.title || "-"}
                  </p>
                  <p className={`mt-2 text-sm leading-6 ${detailTheme.muted}`}>
                    {complaint.task?.notes || "No task notes added."}
                  </p>
                </section>
              ) : null}

              <section
                className={`rounded-lg border p-4 ${detailTheme.surface}`}
              >
                <p
                  className={`text-xs font-semibold uppercase ${detailTheme.label}`}
                >
                  Message
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                  {complaint.message || "-"}
                </p>
              </section>

              {complaint.resolutionNote ? (
                <section
                  className={`rounded-lg border p-4 ${detailTheme.surface}`}
                >
                  <p
                    className={`text-xs font-semibold uppercase ${detailTheme.label}`}
                  >
                    Resolution Note
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                    {complaint.resolutionNote}
                  </p>
                </section>
              ) : null}

              {Array.isArray(complaint.workUpdates) &&
              complaint.workUpdates.length > 0 ? (
                <section
                  className={`rounded-lg border p-4 ${detailTheme.surface}`}
                >
                  <p
                    className={`text-xs font-semibold uppercase ${detailTheme.label}`}
                  >
                    Work Updates
                  </p>
                  <div className="mt-3 space-y-3">
                    {complaint.workUpdates.map((update, index) => (
                      <div
                        key={update?._id || `${update?.updatedAt}-${index}`}
                        className={`rounded-md border p-3 ${detailTheme.surfaceAlt}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span
                            className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${getStatusClasses(
                              update?.status,
                              isDarkTheme,
                            )}`}
                          >
                            {formatLabel(update?.status || "update")}
                          </span>
                          <span className={`text-xs ${detailTheme.muted}`}>
                            {formatDate(update?.updatedAt)}
                          </span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                          {update?.message || "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
