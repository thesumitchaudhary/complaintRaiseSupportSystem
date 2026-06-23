import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { createEmployee } from "../services/employee";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";

const initialEmployeeForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function AddEmployeeModal({ open, onOpenChange, theme = false }) {
  const [employeeForm, setEmployeeForm] = useState(initialEmployeeForm);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const modalTheme = theme
    ? {
        panel: "border-blue-900/60 bg-slate-900 text-slate-100",
        field:
          "border-blue-900/70 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500",
        divider: "border-blue-900/60",
        muted: "text-slate-400",
        button: "border-blue-900/70 text-slate-100 hover:bg-slate-800",
        error: "border-red-900/70 bg-red-950/50 text-red-200",
        title: "text-slate-100",
      }
    : {
        panel: "border-[#b8d8ff] bg-white text-[#001a3a]",
        field:
          "border-[#b8d8ff] bg-white text-[#001a3a] placeholder:text-[#6a7f9e] focus-visible:ring-blue-400",
        divider: "border-[#c7ddff]",
        muted: "text-[#4e678a]",
        button: "border-[#b8d8ff] text-[#12365c] hover:bg-[#eef6ff]",
        error: "border-red-200 bg-red-50 text-red-700",
        title: "text-[#001a3a]",
      };

  const resetForm = () => {
    setEmployeeForm(initialEmployeeForm);
    setError("");
  };

  const employeeMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["showActiveEmployee"],
      });
      toast.success("Employee created successfully");
      resetForm();
      onOpenChange(false);
    },
    onError: (mutationError) => {
      const message =
        mutationError.response?.data?.message ||
        mutationError.message ||
        "Failed to create employee";

      setError(message);
      toast.error(message);
    },
  });

  const handleOpenChange = (nextOpen) => {
    onOpenChange(nextOpen);

    if (!nextOpen && !employeeMutation.isPending) {
      resetForm();
    }
  };

  const handleEmployeeChange = (event) => {
    const { name, value } = event.target;

    setEmployeeForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleEmployeeSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!employeeForm.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!employeeForm.email.trim()) {
      setError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(employeeForm.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!employeeForm.password.trim()) {
      setError("Password is required");
      return;
    }

    if (!employeeForm.confirmPassword.trim()) {
      setError("Confirm password is required");
      return;
    }

    if (employeeForm.password !== employeeForm.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    employeeMutation.mutate(employeeForm);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className={`${modalTheme.panel} flex h-dvh w-full max-w-full flex-col overflow-hidden p-0 sm:max-w-md`}
      >
        <SheetHeader
          className={`border-b px-4 pb-4 pt-6 text-left sm:px-6 sm:pb-5 sm:pt-7 ${modalTheme.divider}`}
        >
          <SheetTitle className={modalTheme.title}>Add Employee</SheetTitle>
          <SheetDescription className={modalTheme.muted}>
            Capture the employee details before adding them to the roster.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleEmployeeSubmit}
          aria-busy={employeeMutation.isPending}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:gap-5 sm:px-6 sm:py-6"
        >
          {error ? (
            <p
              className={`rounded-md border px-3 py-2 text-sm ${modalTheme.error}`}
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <label
            htmlFor="employee-name"
            className="space-y-2 text-sm font-semibold"
          >
            <span className="block">Name</span>
            <Input
              id="employee-name"
              name="name"
              value={employeeForm.name}
              onChange={handleEmployeeChange}
              placeholder="Enter employee name"
              autoComplete="name"
              required
              aria-invalid={error === "Name is required"}
              className={`h-11 ${modalTheme.field}`}
            />
          </label>

          <label
            htmlFor="employee-email"
            className="space-y-2 text-sm font-semibold"
          >
            <span className="block">Email</span>
            <Input
              id="employee-email"
              name="email"
              type="email"
              value={employeeForm.email}
              onChange={handleEmployeeChange}
              placeholder="employee@company.com"
              autoComplete="email"
              required
              aria-invalid={
                error === "Email is required" ||
                error === "Please enter a valid email address"
              }
              className={`h-11 ${modalTheme.field}`}
            />
          </label>

          <label
            htmlFor="employee-password"
            className="space-y-2 text-sm font-semibold"
          >
            <span className="block">Password</span>
            <Input
              id="employee-password"
              name="password"
              type="password"
              value={employeeForm.password}
              onChange={handleEmployeeChange}
              placeholder="Enter password"
              autoComplete="new-password"
              required
              aria-invalid={error === "Password is required"}
              className={`h-11 ${modalTheme.field}`}
            />
          </label>

          <label
            htmlFor="employee-confirm-password"
            className="space-y-2 text-sm font-semibold"
          >
            <span className="block">Confirm Password</span>
            <Input
              id="employee-confirm-password"
              name="confirmPassword"
              type="password"
              value={employeeForm.confirmPassword}
              onChange={handleEmployeeChange}
              placeholder="Confirm password"
              autoComplete="new-password"
              required
              aria-invalid={
                error === "Confirm password is required" ||
                error === "Passwords do not match"
              }
              className={`h-11 ${modalTheme.field}`}
            />
          </label>

          <footer
            className={`mt-auto flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row ${modalTheme.divider}`}
          >
            <Button
              type="button"
              variant="outline"
              disabled={employeeMutation.isPending}
              onClick={() => handleOpenChange(false)}
              className={`h-11 w-full flex-1 rounded-none ${modalTheme.button}`}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={employeeMutation.isPending}
              className="h-11 w-full flex-1 rounded-none bg-blue-600 text-white hover:bg-blue-700"
            >
              {employeeMutation.isPending ? "Saving..." : "Save Employee"}
            </Button>
          </footer>
        </form>
      </SheetContent>
    </Sheet>
  );
}
