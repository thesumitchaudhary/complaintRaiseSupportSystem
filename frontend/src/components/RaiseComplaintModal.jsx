import { useState } from "react";
import {
  AlertCircle,
  FileText,
  Mail,
  MessageSquare,
  Info,
  RefreshCw,
  Loader2,
  Send,
  User,
  Wrench,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { createTicket } from "../services/user";

const initialFormData = {
  name: "",
  email: "",
  subject: "",
  serviceType: "",
  message: "",
};

const serviceTypes = [
  { value: "ac_repair", label: "AC Repair" },
  { value: "pc_repair", label: "PC Repair" },
  { value: "office_work", label: "Office Work" },
];

export function RaiseComplaintModal({ open, onOpenChange, theme }) {
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");

  const isDark = Boolean(theme);

  const queryClient = useQueryClient();

  const ticketMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      setFormData(initialFormData);
      queryClient.invalidateQueries({
        queryKey: ["showRaisedTicked"],
      });
      onOpenChange(false);
    },
    onError: (mutationError) => {
      setError(mutationError?.message || "Failed to raise complaint");
    },
  });

  const loading = ticketMutation.isPending;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.trim()) return "Email is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address";
    }

    if (!formData.subject.trim()) return "Subject is required";
    if (!formData.serviceType) return "Please select a service type";
    if (!formData.message.trim()) return "Message is required";

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    await ticketMutation.mutateAsync(formData);
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setError("");
    ticketMutation.reset();
  };

  const panelClass = isDark
    ? "border-slate-800 bg-slate-950 text-white"
    : "border-slate-200 bg-slate-50 text-slate-950";

  const labelClass = isDark ? "text-slate-200" : "text-slate-700";
  const hintClass = isDark ? "text-slate-400" : "text-slate-500";
  const inputClass = isDark
    ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500"
    : "border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-cyan-600";
  const fieldShellClass = isDark
    ? "border-slate-800 bg-slate-900/70"
    : "border-slate-200 bg-white";

  const renderLabel = (htmlFor, Icon, label, hint) => (
    <div className="flex items-start justify-between gap-3">
      <label
        htmlFor={htmlFor}
        className={`flex items-center gap-2 text-sm font-semibold ${labelClass}`}
      >
        <Icon className="h-4 w-4 text-cyan-500" aria-hidden="true" />
        {label}
      </label>
      {hint && <span className={`text-xs ${hintClass}`}>{hint}</span>}
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={`${panelClass} flex h-full w-full flex-col overflow-y-auto p-0 sm:max-w-[460px]`}
      >
        <div
          className={`border-b px-6 py-5 ${
            isDark
              ? "border-slate-800 bg-slate-950"
              : "border-slate-200 bg-white"
          }`}
        >
          <SheetHeader className="space-y-1 text-left">
            <div className="flex items-center justify-between gap-3">
              <SheetTitle
                className={`text-xl font-semibold ${
                  isDark ? "text-white" : "text-slate-950"
                }`}
              >
                Raise a New Complaint
              </SheetTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="Show complaint form information"
                      className={`flex h-9 w-9 items-center justify-center rounded-md border transition ${
                        isDark
                          ? "border-slate-700 text-cyan-300 hover:bg-slate-900"
                          : "border-slate-200 text-cyan-700 hover:bg-cyan-50"
                      }`}
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    sideOffset={8}
                    className={`block max-w-72 rounded-md border p-3 text-left shadow-lg ${
                      isDark
                        ? "border-slate-700 bg-slate-950 text-slate-100"
                        : "border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    <p className="font-semibold">Complaint Form Info</p>
                    <ul className="mt-2 list-disc space-y-1 pl-4">
                      <li>Use an active, valid email address.</li>
                      <li>Keep the subject short and clear.</li>
                      <li>Select the correct service type.</li>
                      <li>
                        Add issue details, timing, and steps already tried.
                      </li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </SheetHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <div className="flex-1 space-y-4 px-6 py-5">
            {error && (
              <div
                className={`flex items-start gap-3 rounded-md border p-3 text-sm ${
                  isDark
                    ? "border-red-900/70 bg-red-950/70 text-red-100"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
                role="alert"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                <span>{error}</span>
              </div>
            )}

            <div
              className={`rounded-md border p-4 shadow-sm ${fieldShellClass}`}
            >
              <div className="space-y-3">
                {renderLabel("name", User, "Name")}
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
            </div>

            <div
              className={`rounded-md border p-4 shadow-sm ${fieldShellClass}`}
            >
              <div className="space-y-3">
                {renderLabel("email", Mail, "Email")}
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div
              className={`rounded-md border p-4 shadow-sm ${fieldShellClass}`}
            >
              <div className="space-y-3">
                {renderLabel("subject", FileText, "Subject")}
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Short summary of the issue"
                  value={formData.subject}
                  onChange={handleChange}
                  className={inputClass}
                  disabled={loading}
                />
              </div>
            </div>

            <div
              className={`rounded-md border p-4 shadow-sm ${fieldShellClass}`}
            >
              <div className="space-y-3">
                {renderLabel("serviceType", Wrench, "Service Type")}
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className={`h-10 w-full rounded-md border px-3 text-sm outline-none transition focus:ring-2 focus:ring-offset-0 ${inputClass}`}
                  disabled={loading}
                >
                  <option value="">Select service type</option>
                  {serviceTypes.map((service) => (
                    <option key={service.value} value={service.value}>
                      {service.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className={`rounded-md border p-4 shadow-sm ${fieldShellClass}`}
            >
              <div className="space-y-3">
                {renderLabel("message", MessageSquare, "Message", "Required")}
                <textarea
                  id="message"
                  name="message"
                  placeholder="Describe what happened, when it started, and anything already tried."
                  value={formData.message}
                  onChange={handleChange}
                  className={`min-h-32 w-full resize-none rounded-md border p-3 text-sm outline-none transition focus:ring-2 focus:ring-offset-0 ${inputClass}`}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div
            className={`sticky bottom-0 flex gap-3 border-t px-6 py-4 ${
              isDark
                ? "border-slate-800 bg-slate-950"
                : "border-slate-200 bg-white"
            }`}
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={loading}
              className={`h-11 flex-1 gap-2 ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              <RefreshCw className="h-4 w-4" />
              Clear
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 flex-[1.4] gap-2 bg-cyan-600 text-white hover:bg-cyan-700"
            >
              {loading ? (
                <p>
                  <Loader2 className="animate-spin" />
                </p>
              ) : (
                <div className="flex gap-1">
                  <Send className="h-4 w-4" />
                  <span> Submit Complaint</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
