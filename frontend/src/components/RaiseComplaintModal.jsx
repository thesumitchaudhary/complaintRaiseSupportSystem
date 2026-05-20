import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { X } from "lucide-react";
import { createTicket } from "../services/user";
import { useMutation } from "@tanstack/react-query";

export function RaiseComplaintModal({ open, onOpenChange, theme }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    serviceType: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ticketMutation = useMutation({
    mutationFn: (data) => createTicket(data),
    onSuccess: () => {
      console.log("success");
    },
    onError: (error) => {
      console.log("error", error.message);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!formData.subject.trim()) {
      setError("Subject is required");
      return;
    }

    if (!formData.serviceType) {
      setError("Please select a service type");
      return;
    }

    if (!formData.message.trim()) {
      setError("Message is required");
      return;
    }

    try {
      setLoading(true);
      // Add your API call here
      // const response = await raiseComplaint(formData);
         ticketMutation.mutate(formData);
      // console.log("Submitting complaint:", formData);

      // Reset form and close modal after successful submission
      // setFormData({ name: "", email: "", subject: "", message: "" });
      // onOpenChange(false);
    } catch (err) {
      setError(err.message || "Failed to raise complaint");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: "", email: "", subject: "", serviceType: "", message: "" });
    setError("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={`${
          theme
            ? "bg-gray-900 text-white border-gray-700"
            : "bg-white text-black"
        } w-full sm:w-96`}
      >
        <SheetHeader>
          <SheetTitle className={theme ? "text-white" : "text-black"}>
            Raise a New Complaint
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {error && (
            <div
              className={`p-3 rounded-md text-sm ${
                theme ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"
              }`}
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="name"
              className={`text-sm font-medium ${
                theme ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              className={`${
                theme
                  ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                  : "bg-white text-black border-gray-300"
              }`}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className={`text-sm font-medium ${
                theme ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={`${
                theme
                  ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                  : "bg-white text-black border-gray-300"
              }`}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="subject"
              className={`text-sm font-medium ${
                theme ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Subject
            </label>
            <Input
              id="subject"
              name="subject"
              type="text"
              placeholder="Enter complaint subject"
              value={formData.subject}
              onChange={handleChange}
              className={`${
                theme
                  ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                  : "bg-white text-black border-gray-300"
              }`}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="serviceType"
              className={`text-sm font-medium ${
                theme ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Service Type
            </label>
            <select
              id="serviceType"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className={`w-full p-2 rounded-md text-sm border ${
                theme
                  ? "bg-gray-800 text-white border-gray-600"
                  : "bg-white text-black border-gray-300"
              }`}
              disabled={loading}
            >
              <option value="">Select a service type</option>
              <option value="ac_repair">AC Repair</option>
              <option value="pc_repair">PC Repair</option>
              <option value="office_work">Office Work</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="message"
              className={`text-sm font-medium ${
                theme ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="Describe your complaint in detail"
              value={formData.message}
              onChange={handleChange}
              className={`w-full h-32 p-3 rounded-md text-sm border ${
                theme
                  ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                  : "bg-white text-black border-gray-300"
              }`}
              disabled={loading}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={loading}
              className={`flex-1 ${
                theme
                  ? "border-gray-600 text-white bg-white hover:bg-gray-800"
                  : "border-gray-300 text-white hover:text-black hover:bg-gray-100"
              }`}
            >
              Clear
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
