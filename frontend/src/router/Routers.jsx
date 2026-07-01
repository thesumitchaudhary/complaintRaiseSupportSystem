import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";

import SeoManager from "../components/SeoManager";
import UserDashboardPage from "../pages/user/dashboard/Page";

const Home = lazy(() => import("../pages/Home"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const NotFound = lazy(() => import("../pages/NotFound"));
const UserRaiseComplaintPage = lazy(
  () => import("../pages/user/raisecomplaint/Page"),
);
const UserComplaintHistoryPage = lazy(
  () => import("../pages/user/complaint-history/Page"),
);
const AdminDashboardPage = lazy(() => import("../pages/admin/dashboard/Page"));
const AdminAssignTaskPage = lazy(
  () => import("../pages/admin/assign-task/Page"),
);
const AdminEmployeePage = lazy(() => import("../pages/admin/employee/Page"));
const AdminUsersPage = lazy(() => import("../pages/admin/user/Page"));
const AdminComplaintsPage = lazy(
  () => import("../pages/admin/complaints/Page"),
);
const EmployeeAllTaskPage = lazy(
  () => import("../pages/employee/all-task/Page"),
);
const EmployeeTaskCompletedPage = lazy(
  () => import("../pages/employee/completed/Page"),
);
const EmployeeTaskInProgressPage = lazy(
  () => import("../pages/employee/in-progress/Page"),
);
const EmployeeTaskPendingPage = lazy(
  () => import("../pages/employee/pending/Page"),
);

const RouteLoadingFallback = () => (
  <div
    className="grid min-h-screen place-items-center bg-[#f8fbff] px-4 text-[#001a3a]"
    role="status"
    aria-live="polite"
  >
    <div className="flex items-center gap-3 text-sm font-medium">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
      Loading page…
    </div>
  </div>
);

const Routers = () => {
  return (
    <div>
      <BrowserRouter>
        <SeoManager />
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path={"/"} element={<Home />} />
            <Route
              path={"/dashboard"}
              element={<Navigate to="/user-dashboard" replace />}
            />
            <Route path={"/reset-password"} element={<ResetPassword />} />

            {/* this is for user dashboard blocks */}
            <Route path={"/user-dashboard"} element={<UserDashboardPage />} />
            <Route
              path={"/user-raisecomplaint"}
              element={<UserRaiseComplaintPage />}
            />
            <Route
              path={"/user-complainthistory"}
              element={<UserComplaintHistoryPage />}
            />

            {/* this is for admin dashboard blocks */}
            <Route path={"/admin-dashboard"} element={<AdminDashboardPage />} />
            <Route
              path={"/admin-addservice"}
              element={<Navigate to="/admin-dashboard" replace />}
            />
            <Route path={"/admin-employee"} element={<AdminEmployeePage />} />
            <Route
              path={"/admin-assigntask"}
              element={<AdminAssignTaskPage />}
            />
            <Route
              path={"/admin-complaints"}
              element={<AdminComplaintsPage />}
            />
            <Route path={"/admin-user"} element={<AdminUsersPage />} />

            {/* this is for employee dashboard blocks */}
            <Route
              path={"/employee-alltaskpage"}
              element={<EmployeeAllTaskPage />}
            />
            <Route
              path={"/employee-taskcompletedpage"}
              element={<EmployeeTaskCompletedPage />}
            />
            <Route
              path={"/employee-taskinprogresspage"}
              element={<EmployeeTaskInProgressPage />}
            />
            <Route
              path={"/employee-taskpendingpage"}
              element={<EmployeeTaskPendingPage />}
            />

            {/* Show this page when no route above matches the URL */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
};

export default Routers;
