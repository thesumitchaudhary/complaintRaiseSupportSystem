import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "Support System";
const DEFAULT_DESCRIPTION =
  "Manage customer complaints, track ticket progress, and connect users with support teams through one secure support platform.";

const ROUTE_METADATA = {
  "/": {
    title: "Customer Support & Complaint Tracking | Support System",
    description: DEFAULT_DESCRIPTION,
    indexable: true,
  },
  "/reset-password": {
    title: "Reset Password | Support System",
    description: "Securely reset your Support System account password.",
  },
  "/user-dashboard": {
    title: "Customer Dashboard | Support System",
    description: "View your customer support dashboard and complaint activity.",
  },
  "/user-raisecomplaint": {
    title: "Raise a Complaint | Support System",
    description: "Create and manage a customer support complaint.",
  },
  "/user-complainthistory": {
    title: "Complaint History | Support System",
    description: "Review the status and history of your support complaints.",
  },
  "/admin-dashboard": {
    title: "Admin Dashboard | Support System",
    description: "Manage support operations from the administrator dashboard.",
  },
  "/admin-employee": {
    title: "Employee Management | Support System",
    description: "Manage support employees and team access.",
  },
  "/admin-assigntask": {
    title: "Assign Support Tasks | Support System",
    description: "Assign customer complaints to support employees.",
  },
  "/admin-complaints": {
    title: "Complaint Management | Support System",
    description: "Review and manage customer support complaints.",
  },
  "/admin-user": {
    title: "User Management | Support System",
    description: "Manage registered Support System users.",
  },
  "/employee-alltaskpage": {
    title: "Assigned Tasks | Support System",
    description: "Review all customer support tasks assigned to your account.",
  },
  "/employee-taskcompletedpage": {
    title: "Completed Tasks | Support System",
    description: "Review your completed customer support tasks.",
  },
  "/employee-taskinprogresspage": {
    title: "Tasks in Progress | Support System",
    description: "Review customer support tasks currently in progress.",
  },
  "/employee-taskpendingpage": {
    title: "Pending Tasks | Support System",
    description: "Review customer support tasks waiting for action.",
  },
};

const NOT_FOUND_METADATA = {
  title: "Page Not Found | Support System",
  description: "The requested Support System page could not be found.",
};

const getOrCreateMeta = (attribute, value) => {
  let element = document.head.querySelector(`meta[${attribute}="${value}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }

  return element;
};

const setMeta = (attribute, value, content) => {
  getOrCreateMeta(attribute, value).setAttribute("content", content);
};

const getCanonicalUrl = (pathname) => {
  const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim().replace(
    /\/+$/,
    "",
  );
  const origin = configuredSiteUrl || window.location.origin;

  return new URL(pathname, `${origin}/`).toString();
};

const SeoManager = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalizedPath = pathname.toLowerCase().replace(/\/+$/, "") || "/";
    const metadata = ROUTE_METADATA[normalizedPath] || NOT_FOUND_METADATA;
    const canonicalPath = metadata.indexable ? "/" : pathname;
    const canonicalUrl = getCanonicalUrl(canonicalPath);
    const robots = metadata.indexable
      ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      : "noindex, nofollow, noarchive";

    document.title = metadata.title;
    document.documentElement.lang = "en";

    setMeta("name", "description", metadata.description);
    setMeta("name", "robots", robots);
    setMeta("name", "googlebot", robots);
    setMeta("property", "og:title", metadata.title);
    setMeta("property", "og:description", metadata.description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("name", "twitter:card", "summary");
    setMeta("name", "twitter:title", metadata.title);
    setMeta("name", "twitter:description", metadata.description);

    let canonical = document.head.querySelector('link[rel="canonical"]');

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }

    canonical.setAttribute("href", canonicalUrl);

    const existingStructuredData = document.getElementById(
      "support-system-structured-data",
    );

    if (metadata.indexable) {
      const structuredData =
        existingStructuredData || document.createElement("script");

      structuredData.id = "support-system-structured-data";
      structuredData.type = "application/ld+json";
      structuredData.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: SITE_NAME,
        url: canonicalUrl,
        description: DEFAULT_DESCRIPTION,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript and a modern web browser",
      });

      if (!existingStructuredData) {
        document.head.appendChild(structuredData);
      }
    } else {
      existingStructuredData?.remove();
    }
  }, [pathname]);

  return null;
};

export default SeoManager;
