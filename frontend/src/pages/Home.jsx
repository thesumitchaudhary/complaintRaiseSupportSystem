import { useState } from "react";
import AdminLogin from "./AdminLogin";
import UserLogin from "./Registration&Login";
import {
  Moon,
  Sun,
  ArrowRight,
  TrendingUp,
  Clock4,
  Users,
  ShieldCheck,
  Sparkles,
  Headset,
  Mail,
  Phone,
  MapPin,
  // Linkedin,
  // Twitter,
  // Instagram,
} from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const [theme, setTheme] = useState(false);
  const [openAdminLogin, setOpenAdminLogin] = useState(false);
  const [openUserLogin, setOpenUserLogin] = useState(false);

  const stats = [
    { value: "10K+", label: "Happy Customers", icon: Users },
    { value: "50K+", label: "Tickets Resolved", icon: ShieldCheck },
    { value: "98%", label: "Satisfaction Rate", icon: TrendingUp },
    { value: "2 hrs", label: "Avg Response Time", icon: Clock4 },
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

  const quickLinks = [
    { label: "Home", href: "#top" },
    { label: "Service metrics", href: "#performance" },
    { label: "Platform features", href: "#features" },
    { label: "Get support", href: "#get-support" },
  ];

  const resources = [
    { label: "24/7 live support", href: "#features" },
    { label: "Complaint tracking", href: "#features" },
    { label: "Secure role-based access", href: "#features" },
    { label: "Contact information", href: "#contact" },
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
      id="top"
      className={`min-h-screen transition-colors duration-300 ${
        theme ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      <div
        className={`absolute inset-0 z-0 pointer-events-none ${
          theme
            ? "bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.15),transparent_30%),radial-gradient(circle_at_80%_15%,rgba(245,158,11,0.18),transparent_28%)]"
            : "bg-[radial-gradient(circle_at_12%_18%,rgba(14,165,233,0.22),transparent_30%),radial-gradient(circle_at_88%_14%,rgba(245,158,11,0.28),transparent_32%),linear-gradient(to_bottom,rgba(255,255,255,0.7),rgba(248,250,252,0.85))]"
        }`}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p
              className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                theme ? "text-sky-300" : "text-sky-700"
              }`}
            >
              Customer Care Platform
            </p>
            <Link
              to="/"
              className="block text-3xl font-black leading-tight sm:text-4xl lg:text-5xl"
              aria-label="Support System home"
            >
              Support System
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className={`rounded-lg border p-2.5 transition ${
                theme
                  ? "border-slate-700 bg-slate-900 hover:bg-slate-800"
                  : "border-slate-200 bg-white hover:bg-slate-100"
              }`}
              aria-label="Toggle theme"
            >
              {theme ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={() => setOpenUserLogin(true)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition sm:text-base ${
                theme
                  ? "border-slate-600 bg-transparent hover:bg-slate-800"
                  : "border-slate-300 bg-white hover:bg-slate-100"
              }`}
            >
              User Login
            </button>
          </div>
        </header>

        <main className="space-y-10 sm:space-y-12">
          <section
            id="performance"
            className={`overflow-hidden rounded-3xl border p-6 shadow-xl sm:p-8 lg:p-10 ${
              theme
                ? "border-slate-700 bg-slate-900/70"
                : "border-slate-200 bg-white/95"
            }`}
          >
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${
                    theme
                      ? "border-slate-700 bg-slate-900 text-amber-300"
                      : "border-slate-200 bg-slate-100 text-amber-700"
                  }`}
                >
                  <Sparkles size={14} />
                  Trusted By Growing Teams
                </div>
                <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                  Fast, Human-Centered Support For Every Ticket
                </h1>
                <p
                  className={`mt-4 max-w-2xl text-sm leading-relaxed sm:text-base ${
                    theme ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Resolve issues faster with role-based dashboards, real-time
                  updates, and a support workflow built for transparency.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => setOpenUserLogin(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/30 transition hover:bg-sky-700"
                  >
                    Get Started
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => setOpenAdminLogin(true)}
                    className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                      theme
                        ? "border-slate-600 hover:bg-slate-800"
                        : "border-slate-300 bg-white hover:bg-slate-100"
                    }`}
                  >
                    Access Admin Portal
                  </button>
                </div>
              </div>

              <div
                className={`rounded-2xl border p-5 sm:p-6 ${
                  theme
                    ? "border-slate-700 bg-slate-950/70"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-600">
                  Live Performance
                </p>
                <div className="mt-5 space-y-4">
                  {stats.map((item) => {
                    const StatIcon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                          theme
                            ? "border-slate-700 bg-slate-900"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-lg p-2 ${
                              theme
                                ? "bg-slate-800 text-amber-300"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            <StatIcon size={16} />
                          </span>
                          <p className="text-sm font-medium">{item.label}</p>
                        </div>
                        <p className="text-base font-bold sm:text-lg">
                          {item.value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section
            id="features"
            className={`rounded-3xl border p-6 sm:p-8 ${
              theme
                ? "border-slate-700 bg-slate-900/60"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-5 flex items-center gap-2">
              <Headset
                size={18}
                className={theme ? "text-sky-300" : "text-sky-700"}
              />
              <h2 className="text-2xl font-bold sm:text-3xl">
                Why Teams Choose Our Support Center
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className={`rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
                      theme
                        ? "border-slate-700 bg-slate-900 hover:shadow-sky-950/40"
                        : "border-slate-200 bg-slate-50 hover:shadow-slate-300/50"
                    }`}
                  >
                    <div
                      className={`inline-flex rounded-xl p-2.5 ${
                        theme
                          ? "bg-sky-900/40 text-sky-200"
                          : "bg-sky-100 text-sky-700"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                    <p
                      className={`mt-2 text-sm leading-relaxed ${
                        theme ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          <section
            id="get-support"
            className={`rounded-3xl border p-6 sm:p-8 ${
              theme
                ? "border-slate-700 bg-slate-900/50"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-amber-600">
                  Need Immediate Help?
                </p>
                <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                  Raise A Complaint In Under 2 Minutes
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpenUserLogin(true)}
                className="inline-flex items-center gap-2 self-start rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-400"
              >
                Start New Ticket
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </main>
      </div>

      <footer
        className={`mt-10 w-full border-y p-5 sm:p-8 ${
          theme
            ? "border-slate-700 bg-slate-900/80"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="mx-auto w-full max-w-6xl">
          <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <h2 className="sr-only">
              Support System links and contact information
            </h2>
            <article>
              <h3 className="text-lg font-semibold">Support Center</h3>
              <p
                className={`mt-2 text-sm ${
                  theme ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Your trusted partner for exceptional customer support and
                service excellence.
              </p>
            </article>

            <nav aria-label="Quick links">
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul
                className={`mt-2 space-y-1 text-sm ${
                  theme ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="transition hover:text-sky-600 hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Support resources">
              <h3 className="text-lg font-semibold">Resources</h3>
              <ul
                className={`mt-2 space-y-1 text-sm ${
                  theme ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {resources.map((resource) => (
                  <li key={resource.label}>
                    <a
                      href={resource.href}
                      className="transition hover:text-sky-600 hover:underline"
                    >
                      {resource.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <article id="contact">
              <h3 className="text-lg font-semibold">Contact</h3>
              <div
                className={`mt-2 space-y-1 text-sm ${
                  theme ? "text-slate-300" : "text-slate-600"
                }`}
              >
                <a
                  href="mailto:support@example.com"
                  className="flex items-center gap-2 transition hover:text-sky-600 hover:underline"
                >
                  <Mail size={14} aria-hidden="true" /> support@example.com
                </a>
                <a
                  href="tel:+919465645534"
                  className="flex items-center gap-2 transition hover:text-sky-600 hover:underline"
                >
                  <Phone size={14} aria-hidden="true" /> +91-9465645534
                </a>
                <p className="inline-flex items-center gap-2">
                  <MapPin size={14} aria-hidden="true" /> Old High Court,
                  Ahmedabad
                </p>
              </div>
            </article>
          </section>

          <div
            className={`mt-8 border-t pt-4 text-xs sm:text-sm ${
              theme
                ? "border-slate-700 text-slate-400"
                : "border-slate-200 text-slate-500"
            }`}
          >
            <p>
              © 2026 Support System. Built to keep your customer conversations
              clear, secure, and fast.
            </p>
          </div>
        </div>
      </footer>

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
