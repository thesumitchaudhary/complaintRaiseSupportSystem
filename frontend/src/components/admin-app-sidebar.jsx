import {
  ClipboardCheck,
  LayoutDashboard,
  MessageSquareWarning,
  Users,
} from "lucide-react";
import { RoleSidebar } from "./RoleSidebar";
import { userLogout } from "../services/user";

const items = [
  {
    title: "Dashboard",
    url: "/admin-dashboard",
    icon: <LayoutDashboard />,
    isActive: true,
  },
  {
    title: "Complaint",
    url: "/admin-complaints",
    icon: <MessageSquareWarning />,
  },
  {
    title: "AssignTask",
    url: "/admin-assigntask",
    icon: <ClipboardCheck />,
  },
  {
    title: "Employees",
    url: "/admin-employee",
    icon: <Users />,
  },
  {
    title: "Users",
    url: "/admin-user",
    icon: <Users />,
  },
];

export function AppSidebar(props) {
  return <RoleSidebar items={items} logout={userLogout} {...props} />;
}
