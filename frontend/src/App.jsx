import "./App.css";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashbord";
import ResetPassword from "./pages/ResetPassword";
import { Routes, Route } from "react-router-dom";

// this is for the user pages direction
import UserDashboardPage from "./pages/user/dashboard/Page";
import UserInprogressPage from "./pages/user/in-progress/Page";
import UserPendingPage from "./pages/user/pending/Page";
import UserRejectedPage from "./pages/user/rejected/Page";

function App() {
  return (
    <>
      <Routes>
        <Route path={"/"} element={<Home />} />
        <Route path={"/dashboard"} element={<Dashboard />} />
        <Route path={"/reset-password"} element={<ResetPassword />} />

        {/* this is for user dashboard blocks */}
        <Route path={"/User/Dashboard"} element={<UserDashboardPage />} />
        <Route path={"/User/Inprogress"} element={<UserInprogressPage />} />
        <Route path={"/User/Pending"} element={<UserPendingPage />} />
        <Route path={"/User/Rejected"} element={<UserRejectedPage />} />

        {/* this is for admin dashboard blocks */}
        
      </Routes>
    </>
  );
}

export default App;
