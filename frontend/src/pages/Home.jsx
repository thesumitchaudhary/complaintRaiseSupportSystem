import { useState } from "react";
import AdminLogin from "./AdminLogin";
import UserLogin from "./UserLogin";
import { Link } from "react-router-dom";
import { Moon, Sun, User } from "lucide-react";

const Home = () => {
  const [theme, setTheme] = useState(false);
  const [openAdminLogin, setOpenAdminLogin] = useState(false);
  const [openUserLogin, setOpenUserLogin] = useState(false);

  const toggleTheme = () => {
    setTheme(!theme);
  };

  const onClose = () => {
    setOpenAdminLogin(false);
  };

  const closeUserLogin = () => {
    setOpenUserLogin(false);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      } p-4 sm:p-6 md:p-8`}
    >
      {/* Header */}
      <header className="mb-8 flex flex-col gap-3 sm:gap-6 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-7xl sm:text-3xl md:text-4xl font-black  whitespace-nowrap">
          Support System
        </h1>

        {/* Button Container */}
        <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 items-center">
          <button
            onClick={toggleTheme}
            className={`p-1.5 sm:px-4 md:px-6 sm:py-2.5 md:py-3 rounded font-medium transition-all ${
              theme
                ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
            }`}
          >
            {theme ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            onClick={() => setOpenUserLogin(true)}
            className={`border text-xs sm:text-sm md:text-base py-1.5 sm:py-2.5 md:py-3 px-2 sm:px-5 md:px-6 rounded-xl font-medium transition-all ${
              theme
                ? "hover:bg-gray-700 border-gray-600"
                : "hover:bg-gray-200 border-gray-300"
            }`}
          >
            User Login
          </button>
          {/* <button className={`border text-xs sm:text-sm md:text-base py-1.5 sm:py-2.5 md:py-3 px-2 sm:px-5 md:px-6 rounded-xl font-medium transition-all ${
            theme
              ? "hover:bg-gray-700 border-gray-600"
              : "hover:bg-gray-200 border-gray-300"
          }`}>
            <Link to={"/contact"}>Submit Ticket</Link>
          </button> */}
          <button
            onClick={() => setOpenAdminLogin(true)}
            className="text-xs sm:text-sm md:text-base px-3 sm:px-5 md:px-6 py-1.5 sm:py-2.5 md:py-3 rounded font-medium transition-all bg-blue-600 hover:bg-blue-700 text-white border border-blue-600"
          >
            Admin Login
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto">
        <div
          className={`rounded-lg p-6 sm:p-8 md:p-10 ${
            theme ? "bg-gray-800" : "bg-gray-50"
          }`}
        >
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-semibold whitespace-nowrap text-transparent hover:text-blue-400 transition-colors duration-200 mb-3 sm:mb-4"
            style={{ WebkitTextStroke: "1px #111827" }}
          >
            Welcome To Support System
          </h2>
          <p className="leading-relaxed text-sm sm:text-base md:text-lg">
            This is a support ticket system. Use the admin login button above to
            access the admin panel.
          </p>
        </div>
      </main>

      {/* Admin Login Modal */}
      {openAdminLogin && <AdminLogin onClose={onClose} />}

      {/* User Login Modal */}
      {openUserLogin && <UserLogin closeUserLogin={closeUserLogin} />}
    </div>
  );
};

export default Home;
