import {
  Routes,
  Route,
  Navigate,
  BrowserRouter as Router,
} from "react-router-dom";

import Home from "../pages/Home";
import ResetPassword from "../pages/ResetPassword";
import NotFound from "../pages/NotFound";

// this is for the user pages direction
import UserDashboardPage from "../pages/user/dashboard/Page";
import UserRaiseComplainPage from "../pages/user/raisecomplaint/Page";
import UserCompaintHistoryPage from "../pages/user/complaint-history/Page";

// this is for the admin pages direction
import AdminDashboardPage from "../pages/admin/dashboard/Page";
import AdminAssignTaskPage from "../pages/admin/assign-task/Page";
import AdminEmployeePage from "../pages/admin/employee/Page";
import AdminUsersPage from "../pages/admin/user/Page";
import AdminComplaintsPage from "../pages/admin/complaints/Page";

// this is for the employee pages direction
import EmployeeAllTaskPage from "../pages/employee/all-task/Page";
import EmployeeTaskCompletedPage from "../pages/employee/completed/Page";
import EmployeeTaskInprogressPage from "../pages/employee/in-progress/Page";
import EmployeeTaskPendingPage from "../pages/employee/pending/Page";

const Routers = () => {
  return (
    <div>
      <Router>
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
          <Route path={"/Admin/Assigntask"} element={<AdminAssignTaskPage />} />
          <Route path={"/Admin/Complaints"} element={<AdminComplaintsPage />} />
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
      </Router>
    </div>
  );
};

export default Routers;
