"use client";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  RowsIcon,
  WaveformIcon,
  CommandIcon,
  TerminalIcon,
  RobotIcon,
  BookOpenIcon,
  GearIcon,
  CropIcon,
  ChartPieIcon,
  MapTrifoldIcon,
} from "@phosphor-icons/react";
import { ShieldAlert } from "lucide-react";
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
      title: "All Task",
      url: "/Employee/AllTaskPage",
      icon: <TerminalIcon />,
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
      title: "Pending Task",
      url: "/Employee/TaskPendingPage",
      icon: <RobotIcon />,
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
      title: "Inprogress Task ",
      url: "/Employee/TaskPendingPage",
      icon: <GearIcon />,
      // items: [
      //   {
      //     title: "General",
      //     url: "#",
      //   },
      //   {
      //     title: "Team",
      //     url: "#",
      //   },
      //   {
      //     title: "Billing",
      //     url: "#",
      //   },
      //   {
      //     title: "Limits",
      //     url: "#",
      //   },
      // ],
    },
    {
      title: "Completed Tasks",
      url: "/Employee/TaskCompletedPage",
      icon: <GearIcon />,
      // items: [
      //   {
      //     title: "General",
      //     url: "#",
      //   },
      //   {
      //     title: "Team",
      //     url: "#",
      //   },
      //   {
      //     title: "Billing",
      //     url: "#",
      //   },
      //   {
      //     title: "Limits",
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

export function EmployeeAppSidebar({ ...props }) {
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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
