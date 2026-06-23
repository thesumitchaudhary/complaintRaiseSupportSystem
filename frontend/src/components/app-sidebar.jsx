import { LayoutDashboard, MessageSquareWarning } from "lucide-react";
import { RoleSidebar } from "./RoleSidebar";
import { userLogout } from "../services/user";

const items = [
  {
    title: "Dashboard",
    url: "/User/Dashboard",
    icon: <LayoutDashboard />,
    isActive: true,
  },
  {
    title: "Raise Complaints",
    url: "/User/RaiseComplaint",
    icon: <MessageSquareWarning />,
  },
  {
    title: "Complaints History",
    url: "/User/ComplaintHistory",
    icon: <MessageSquareWarning />,
  },
];

export function AppSidebar(props) {
  return <RoleSidebar items={items} logout={userLogout} {...props} />;
}
