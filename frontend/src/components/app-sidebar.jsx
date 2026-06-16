"use client";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { toast } from "react-hot-toast";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  // RowsIcon,
  // WaveformIcon,
  // CommandIcon,
  // TerminalIcon,
  // RobotIcon,
  BookOpenIcon,
  GearIcon,
  CropIcon,
  ChartPieIcon,
  MapTrifoldIcon,
} from "@phosphor-icons/react";
import {
  ShieldAlert,
  LayoutDashboard,
  MessageSquareWarning,
  BriefcaseBusiness,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { userLogout, getRaisedComplaint } from "../services/user";
// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Support System",
      logo: <ShieldAlert />,
      // plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/User/Dashboard",
      icon: <LayoutDashboard />,
      isActive: true,
      // items: [
      //   {
      //     title: "History",
      //     url: "#",
      //   },
      //   {
      //     title: "Starred",
      //     url: "#",
      //   },
      //   {
      //     title: "Settings",
      //     url: "#",
      //   },
      // ],
    },
    {
      title: "Raise Complaints",
      url: "/User/RaiseComplaint",
      icon: <MessageSquareWarning />,
      // items: [
      //   {
      //     title: "Genesis",
      //     url: "#",
      //   },
      //   {
      //     title: "Explorer",
      //     url: "#",
      //   },
      //   {
      //     title: "Quantum",
      //     url: "#",
      //   },
      // ],
    },
    {
      title: "Complaints History",
      url: "/User/ComplaintHistory",
      icon: <MessageSquareWarning />,
      // items: [
      //   {
      //     title: "Genesis",
      //     url: "#",
      //   },
      //   {
      //     title: "Explorer",
      //     url: "#",
      //   },
      //   {
      //     title: "Quantum",
      //     url: "#",
      //   },
      // ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: <CropIcon />,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: <ChartPieIcon />,
    },
    {
      name: "Travel",
      url: "#",
      icon: <MapTrifoldIcon />,
    },
  ],
};

export function AppSidebar({ ...props }) {
  const navigate = useNavigate();
  const { data: complaintsData } = useQuery({
    queryKey: ["showRaisedTicked"],
    queryFn: getRaisedComplaint,
  });

  const handleLogoutSuccess = useCallback(() => {
    toast.success("logout successful");
    navigate("/");
  }, [navigate]);

  const handleLogoutError = useCallback((error) => {
    console.log(error);
  }, []);

  const logoutMutation = useMutation({
    mutationFn: userLogout,
    onSuccess: handleLogoutSuccess,
    onError: handleLogoutError,
  });
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} onLogout={() => logoutMutation.mutate()} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
