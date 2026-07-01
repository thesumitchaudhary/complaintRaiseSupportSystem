import { BadgeCheck, ClipboardList, Clock3, LoaderCircle } from "lucide-react";
import { RoleSidebar } from "./RoleSidebar";
import { employeeLogout } from "../services/employee";

const items = [
  {
    title: "All Task",
    url: "/employee-alltaskpage",
    icon: <ClipboardList />,
    isActive: true,
  },
  {
    title: "Pending Task",
    url: "/employee-taskpendingpage",
    icon: <Clock3 />,
  },
  {
    title: "In Progress Task",
    url: "/employee-taskinprogresspage",
    icon: <LoaderCircle />,
  },
  {
    title: "Completed Tasks",
    url: "/employee-taskcompletedpage",
    icon: <BadgeCheck />,
  },
];

export function EmployeeAppSidebar(props) {
  return <RoleSidebar items={items} logout={employeeLogout} {...props} />;
}
