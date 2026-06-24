import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";

import SeoManager from "../components/SeoManager";
import UserDashboardPage from "../pages/user/dashboard/Page";

const Home = lazy(() => import("../pages/Home"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const NotFound = lazy(() => import("../pages/NotFound"));
const UserRaiseComplainPage = lazy(
  () => import("../pages/user/raisecomplaint/Page"),
);
const UserCompaintHistoryPage = lazy(
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
const EmployeeTaskInprogressPage = lazy(
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
              path={"/dashboad"}
              element={<Navigate to="/dashboard" replace />}
            />
            <Route path={"/reset-password"} element={<ResetPassword />} />

            {/* this is for user dashboard blocks */}
            <Route path={"/User/Dashboard"} element={<UserDashboardPage />} />
            <Route
              path={"/User/RaiseComplaint"}
              element={<UserRaiseComplainPage />}
            />
            <Route
              path={"/User/ComplaintHistory"}
              element={<UserCompaintHistoryPage />}
            />

            {/* this is for admin dashboard blocks */}
            <Route path={"/Admin/Dashboard"} element={<AdminDashboardPage />} />
            <Route
              path={"/Admin/Addservice"}
              element={<Navigate to="/Admin/Dashboard" replace />}
            />
            <Route path={"/Admin/Employee"} element={<AdminEmployeePage />} />
            <Route
              path={"/Admin/Assigntask"}
              element={<AdminAssignTaskPage />}
            />
            <Route
              path={"/Admin/Complaints"}
              element={<AdminComplaintsPage />}
            />
            <Route path={"/Admin/User"} element={<AdminUsersPage />} />

            {/* this is for employee dashboard blocks */}
            <Route
              path={"/Employee/AllTaskPage"}
              element={<EmployeeAllTaskPage />}
            />
            <Route
              path={"/Employee/TaskCompletedPage"}
              element={<EmployeeTaskCompletedPage />}
            />
            <Route
              path={"/Employee/TaskInprogressPage"}
              element={<EmployeeTaskInprogressPage />}
            />
            <Route
              path={"/Employee/TaskPendingPage"}
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
