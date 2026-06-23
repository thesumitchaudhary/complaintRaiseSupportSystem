import { BadgeCheck, ClipboardList, Clock3, LoaderCircle } from "lucide-react";
import { RoleSidebar } from "./RoleSidebar";
import { employeeLogout } from "../services/employee";

const items = [
  {
    title: "All Task",
    url: "/Employee/AllTaskPage",
    icon: <ClipboardList />,
    isActive: true,
  },
  {
    title: "Pending Task",
    url: "/Employee/TaskPendingPage",
    icon: <Clock3 />,
  },
  {
    title: "In Progress Task",
    url: "/Employee/TaskInprogressPage",
    icon: <LoaderCircle />,
  },
  {
    title: "Completed Tasks",
    url: "/Employee/TaskCompletedPage",
    icon: <BadgeCheck />,
  },
];

export function EmployeeAppSidebar(props) {
  return <RoleSidebar items={items} logout={employeeLogout} {...props} />;
}
