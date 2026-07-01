import {
  LayoutDashboard,
  MessageSquareWarning,
  ScrollText,
} from "lucide-react";
import { RoleSidebar } from "./RoleSidebar";
import { userLogout } from "../services/user";

const items = [
  {
    title: "Dashboard",
    url: "/user-dashboard",
    icon: <LayoutDashboard />,
    isActive: true,
  },
  {
    title: "Raise Complaints",
    url: "/user-raisecomplaint",
    icon: <MessageSquareWarning />,
  },
  {
    title: "Complaints History",
    url: "/user-complainthistory",
    icon: <ScrollText />,
  },
];

export function AppSidebar(props) {
  return <RoleSidebar items={items} logout={userLogout} {...props} />;
}
