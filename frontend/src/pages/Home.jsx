import { useState } from "react";
import AdminLogin from "./AdminLogin";
import UserLogin from "./UserLogin";
import {
  Moon,
  Sun,
  ChevronLeft,
  TrendingUp,
  Clock4,
  Users,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const [theme, setTheme] = useState(false);
  const [openAdminLogin, setOpenAdminLogin] = useState(false);
  const [openUserLogin, setOpenUserLogin] = useState(false);

  const stats = [
    { value: "10K+", label: "Happy Customers" },
    { value: "50K+", label: "Tickets Resolved" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "2hrs", label: "Avg Response Time", icon: ChevronLeft },
  ];

  const highlights = [
    {
      title: "24/7 Live Support",
      description:
        "Round-the-clock assistance for all your queries and concerns.",
      icon: Clock4,
    },
    {
      title: "Secure & Trusted",
      description:
        "Your data and conversations are protected with strong security.",
      icon: ShieldCheck,
    },
    {
      title: "Skilled Team",
      description: "Experienced support professionals resolve issues quickly.",
      icon: Users,
    },
    {
      title: "Continuous Improvement",
      description:
        "Insights and tracking help us improve service quality every day.",
      icon: TrendingUp,
    },
  ];

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
        theme
          ? "bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100"
          : "bg-gradient-to-b from-slate-50 via-white to-blue-50 text-gray-900"
      }`}
    >
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                theme ? "text-blue-300" : "text-blue-700"
              }`}
            >
              Customer Care Platform
            </p>
            <h1 className="mt-1 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              Support System
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className={`rounded-lg border p-2.5 transition ${
                theme
                  ? "border-gray-700 bg-gray-800 hover:bg-gray-700"
                  : "border-gray-200 bg-white hover:bg-gray-100"
              }`}
              aria-label="Toggle theme"
            >
              {theme ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={() => setOpenUserLogin(true)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition sm:text-base ${
                theme
                  ? "border-gray-600 bg-transparent hover:bg-gray-800"
                  : "border-gray-300 bg-white hover:bg-gray-100"
              }`}
            >
              User Login
            </button>
            <button
              onClick={() => setOpenAdminLogin(true)}
              className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 sm:text-base"
            >
              Admin Login
            </button>
            <Link to={"/Employee/AllTaskPage"}>EmployeeDashboard</Link>
          </div>
        </header>

        <main className="space-y-8 sm:space-y-10">
          <section
            className={`overflow-hidden rounded-2xl border p-6 shadow-sm sm:p-8 lg:p-10 ${
              theme
                ? "border-gray-700/80 bg-gray-900/60"
                : "border-gray-200 bg-white/90"
            }`}
          >
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Welcome To Support System
            </h2>
            <p
              className={`mt-4 max-w-3xl text-sm leading-relaxed sm:text-base ${
                theme ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Get the help you need, when you need it. Our dedicated support
              team is here to ensure your success every step of the way.
            </p>
          </section>

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {stats.map((item) => {
              const StatIcon = item.icon;

              return (
                <article
                  key={item.label}
                  className={`rounded-xl border p-4 shadow-sm transition hover:-translate-y-0.5 ${
                    theme
                      ? "border-gray-700 bg-gray-900/70"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <h3 className="flex items-center gap-1.5 text-xl font-bold sm:text-2xl">
                    {StatIcon ? <StatIcon size={18} /> : null}
                    {item.value}
                  </h3>
                  <p
                    className={`mt-1 text-xs sm:text-sm ${
                      theme ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {item.label}
                  </p>
                </article>
              );
            })}
          </section>

          <section>
            <div className="mb-4 sm:mb-5">
              <h4 className="text-2xl font-bold sm:text-3xl">
                Why Choose Our Support Center?
              </h4>
              <p
                className={`mt-2 max-w-2xl text-sm sm:text-base ${
                  theme ? "text-gray-300" : "text-gray-700"
                }`}
              >
                We provide world-class support services designed to help you
                succeed.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className={`rounded-xl border p-5 transition hover:-translate-y-1 hover:shadow-lg ${
                      theme
                        ? "border-gray-700 bg-gray-900/70 hover:shadow-blue-900/30"
                        : "border-gray-200 bg-white hover:shadow-blue-100"
                    }`}
                  >
                    <div
                      className={`inline-flex rounded-lg p-2 ${
                        theme
                          ? "bg-blue-900/40 text-blue-200"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <h5 className="mt-3 text-lg font-semibold">{item.title}</h5>
                    <p
                      className={`mt-2 text-sm leading-relaxed ${
                        theme ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        </main>

        <footer
          className={`mt-10 rounded-2xl border p-5 sm:p-6 ${
            theme
              ? "border-gray-700 bg-gray-900/70"
              : "border-gray-200 bg-white"
          }`}
        >
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <article>
              <h4 className="text-lg font-semibold">Support Center</h4>
              <p
                className={`mt-2 text-sm ${
                  theme ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Your trusted partner for exceptional customer support and
                service excellence.
              </p>
            </article>

            <article>
              <h4 className="text-lg font-semibold">Quick Links</h4>
              <ul
                className={`mt-2 space-y-1 text-sm ${
                  theme ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <li>Home</li>
                <li>User Dashboard</li>
                <li>Admin Portal</li>
                <li>Employee Portal</li>
              </ul>
            </article>

            <article>
              <h4 className="text-lg font-semibold">Support</h4>
              <ul
                className={`mt-2 space-y-1 text-sm ${
                  theme ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <li>Knowledge Base</li>
                <li>Live Chat</li>
                <li>FAQ</li>
                <li>Status Page</li>
              </ul>
            </article>

            <article>
              <h4 className="text-lg font-semibold">Contact</h4>
              <div
                className={`mt-2 space-y-1 text-sm ${
                  theme ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <p>support@example.com</p>
                <p>+91-9465645534</p>
                <p>Old High Court, Ahmedabad</p>
              </div>
            </article>
          </section>
        </footer>
      </div>

      {/* Admin Login Modal */}
      {openAdminLogin && <AdminLogin onClose={onClose} />}

      {/* User Login Modal */}
      {openUserLogin && (
        <UserLogin
          closeUserLogin={closeUserLogin}
          theme={theme}
          setTheme={setTheme}
        />
      )}
    </div>
  );
};

export default Home;
