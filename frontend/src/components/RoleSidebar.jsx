import { useCallback } from "react";
import { ShieldAlert } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const teams = [
  {
    name: "Support System",
    logo: <ShieldAlert />,
  },
];

const user = {
  name: "Support user",
  email: "",
  avatar: "/avatars/shadcn.jpg",
};

export function RoleSidebar({ items, logout, ...props }) {
  const navigate = useNavigate();
  const handleLogoutSuccess = useCallback(() => {
    toast.success("Logout successful");
    navigate("/");
  }, [navigate]);
  const handleLogoutError = useCallback((error) => {
    console.error(error);
    toast.error("Unable to log out");
  }, []);
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: handleLogoutSuccess,
    onError: handleLogoutError,
  });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onLogout={() => logoutMutation.mutate()} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
