import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { userLogout, getRaisedComplaint } from "../services/user";
import { toast } from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";

const UserDashboard = () => {
  const [theme, setTheme] = useState(false);

  const navigate = useNavigate();

  const toggleTheme = useCallback(() => {
    setTheme((prev) => !prev);
  }, []);

  const { data, } = useQuery({
    queryKey: ["showRaisedTicked"],
    queryFn: getRaisedComplaint,
  });

  const cardThemeClasses = theme
    ? "bg-gray-800 border-gray-700 text-gray-100"
    : "bg-white border-gray-200 text-gray-900";

  const handleLogoutSuccess = useCallback(() => {
    toast.success("logout successful");
    navigate("/");
  }, [navigate]);

  const handleLogoutError = useCallback((error) => {
    console.log(error);
  }, []);

  const logoutMutation = useMutation({
    mutationFn: userLogout,
    onSuccess: handleLogoutSuccess,
    onError: handleLogoutError,
  });

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      } p-4 sm:p-6 md:p-8`}
    >
      <header className="flex justify-between">
        <div>
          <h3>User Dashboard</h3>
        </div>
        <div className="flex gap-1">
          <button
            className={`border px-3 py-1 rounded-xl ${theme ? "hover:bg-gray-700 border-gray-600" : "hover:bg-gray-200 border-gray-300"}`}
            onClick={toggleTheme}
          >
            {theme ? <Sun /> : <Moon />}
          </button>
          <button
            className={`border text-xs sm:text-sm md:text-base py-1.5 sm:py-2.5 md:py-3 px-2 sm:px-5 md:px-6 rounded-xl font-medium transition-all ${
              theme
                ? "hover:bg-gray-700 border-gray-600"
                : "hover:bg-gray-200 border-gray-300"
            }`}
          >
            <Link to={"/contact"}>Submit Ticket</Link>
          </button>
          <button
            onClick={() => logoutMutation.mutate()}
            className={`border p-3 rounded-md ${theme ? "border-gray-400" : "border-black"}`}
          >
            Logout
          </button>
        </div>
      </header>
      <main>
        <section className="my-10 mx-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.result?.map((ticket) => (
              <div
                key={ticket._id}
                className={`rounded-lg shadow-sm hover:shadow-lg transition p-6 ${cardThemeClasses}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg mb-1">{ticket.subject}</h4>
                    <p className="text-sm opacity-80">complaintPerson: {ticket.name}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : ticket.status === "Resolved"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-line opacity-90">{ticket.message}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;
