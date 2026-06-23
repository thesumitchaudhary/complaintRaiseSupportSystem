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
    url: "/Admin/Dashboard",
    icon: <LayoutDashboard />,
    isActive: true,
  },
  {
    title: "Complaint",
    url: "/Admin/Complaints",
    icon: <MessageSquareWarning />,
  },
  {
    title: "AssignTask",
    url: "/Admin/Assigntask",
    icon: <ClipboardCheck />,
  },
  {
    title: "Employees",
    url: "/Admin/Employee",
    icon: <Users />,
  },
  {
    title: "Users",
    url: "/Admin/User",
    icon: <Users />,
  },
];

export function AppSidebar(props) {
  return <RoleSidebar items={items} logout={userLogout} {...props} />;
}
