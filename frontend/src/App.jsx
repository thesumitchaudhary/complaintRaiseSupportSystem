import "./App.css";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashbord";
import ResetPassword from "./pages/ResetPassword";
import { Routes, Route } from "react-router-dom";

// this is for the user pages direction
import UserDashboardPage from "./pages/user/dashboard/Page";
import UserRaiseComplainPage from "./pages/user/raisecomplaint/Page";
import UserWorkServicePage from "./pages/user/work-service/Page";
import UserCompaintPage from "./pages/user/complaint-history/Page";

// this is for the admin pages direction
import AdminDashboardPage from "./pages/admin/dashboard/Page";
import AdminAssignTaskPage from "./pages/admin/assign-task/Page";
import AdminEmployeePage from "./pages/admin/employee/Page";
import AdminUsersPage from "./pages/admin/user/Page";
import AdminComplaintsPage from "./pages/admin/complaints/Page";
import AdminAddServicePage from "./pages/admin/add-service/Page";

// this is for the employee pages direction
import EmployeeAllTaskPage from "./pages/employee/all-task/Page";
import EmployeeTaskCompletedPage from "./pages/employee/completed/Page";
import EmployeeTaskInprogressPage from "./pages/employee/in-progress/Page";
import EmployeeTaskPendingPage from "./pages/employee/pending/Page";

function App() {
  return (
    <>
      <Routes>
        <Route path={"/"} element={<Home />} />
        <Route path={"/dashboard"} element={<Dashboard />} />
        <Route path={"/reset-password"} element={<ResetPassword />} />

        {/* this is for user dashboard blocks */}
        <Route path={"/User/Dashboard"} element={<UserDashboardPage />} />
        <Route
          path={"/User/RaiseComplaint"}
          element={<UserRaiseComplainPage />}
        />
        <Route path={"/User/WorkService"} element={<UserWorkServicePage />} />

        {/* this is for admin dashboard blocks */}
        <Route path={"/Admin/Dashboard"} element={<AdminDashboardPage />} />
        <Route path={"/Admin/Employee"} element={<AdminEmployeePage />} />
        <Route path={"/Admin/Assigntask"} element={<AdminAssignTaskPage />} />
        <Route path={"/Admin/Complaints"} element={<AdminComplaintsPage />} />
        <Route path={"/Admin/User"} element={<AdminUsersPage />} />
        <Route path={"/Admin/Addservice"} element={<AdminAddServicePage />} />

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
      </Routes>
    </>
  );
}

export default App;
