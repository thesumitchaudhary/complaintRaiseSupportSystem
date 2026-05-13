import React, { useState } from "react";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import { Input } from "../components/ui/input";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Textarea } from "../components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { createTicket } from "../services/user";

const Contact = () => {
  const [theme, setTheme] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const toggle = () => {
    setTheme(!theme);
  };

  const ticketMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      toast.success("ticket is reaised")
      console.log("success");
    },
    onError: (error) => {
      console.log("error", error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    ticketMutation.mutate({ name, email, subject, message });
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }  sm:p-4 md:p-4 lg:p-12`}
    >
      <header className="flex flex-row justify-between items-center gap-3 mb-8">
        <div>
          <h3 className="text-lg sm:text-3xl md:text-4xl font-bold">
            Complaint Form
          </h3>
          <Link
            className="flex gap-2 text-blue-500 hover:underline text-xs sm:text-sm"
            to={"/userDashboard"}
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>
        <button
          className={`border rounded-md ${theme ? "border-gray-400" : "border-black"} p-1.5 sm:p-2 hover:opacity-80 transition-opacity flex-shrink-0`}
          onClick={toggle}
        >
          {theme ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </header>

      <section
        className={`w-full max-w-2xl mx-auto border p-4 sm:p-5 border-black rounded-2xl ${theme ? "bg-white" : "bg-white"} `}
      >
        <div className="mb-6 md:mb-8">
          <h4 className="text-base sm:text-lg md:text-2xl text-black font-semibold mb-1 sm:mb-2">
            Submit Support Ticket
          </h4>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Fill out the form below and we'll get back to you as soon as
            possible.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          <Input
            type="text"
            className="border border-black"
            placeholder="Enter Your FullName"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="email"
            className="border border-black"
            placeholder="Enter Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="text"
            className="border border-black"
            placeholder="Enter Your Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Textarea
            className="border border-black"
            placeholder="Enter Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Submit
          </button>
        </form>
      </section>
    </div>
  );
};

export default Contact;
