import React, { useState } from "react";
import {
  LogOut,
  Moon,
  Sun,
  User,
  EllipsisVertical,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminLogout,
  deleteComplaint,
  showComplain,
  updateComplaint,
} from "../services/admin";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";

const Dashbord = () => {
  const [theme, setTheme] = useState(false);
  const queryClient = useQueryClient();

  const getStatusBadgeClass = (status) => {
    const normalizedStatus = (status || "Pending").toLowerCase();

    if (normalizedStatus === "resolved") {
      return "bg-green-100 text-green-700 text-xs";
    }

    if (
      normalizedStatus === "in-progress" ||
      normalizedStatus === "in progress"
    ) {
      return "bg-blue-100 text-blue-700 text-xs";
    }

    return "bg-yellow-100 text-yellow-700 text-xs";
  };

  const navigation = useNavigate();

  const toggleTheme = () => {
    setTheme(!theme);
  };

  const logoutMutation = useMutation({
    mutationFn: adminLogout,
    onSuccess: () => {
      toast.success("logout is successfully");
      navigation("/");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["showComplaints"],
    queryFn: showComplain,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateComplaint(id, { status }),
    onSuccess: () => {
      toast.success("complaint status updated successfully")
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const deleteComplaintMutation = useMutation({
    mutationFn: deleteComplaint,
    onSuccess: () => {
      toast.success("complaint deleted successfully")
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const complaints = data?.result || [];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      } p-4 sm:p-6 md:p-8`}
    >
      <header className="flex justify-between">
        <div>
          <h3 className="flex gap-1">
            <User />
            Admin Dashboard
          </h3>
        </div>
        <div className="flex gap-3">
          <button
            className={`border rounded-md p-2 ${theme ? "border-gray-400" : "border-black"}`}
            onClick={toggleTheme}
          >
            {theme ? <Moon /> : <Sun />}
          </button>
          <button
            onClick={() => logoutMutation.mutate()}
            className={`flex border rounded-md border-black p-2 ${theme ? "border-gray-400" : "border-black"}`}
          >
            <LogOut />
            logout
          </button>
        </div>
      </header>
      <section className="p-5">
        <table
          className={`w-full border-collapse ${theme ? "bg-white text-black" : "bg-white text-black"}`}
        >
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-6 py-4 text-black">Name</th>
              <th className="text-left px-6 py-4 text-black">Email</th>
              <th className="text-left px-6 py-4 text-black">Subject</th>
              <th className="text-left px-6 py-4 text-black">message</th>
              <th className="text-left px-6 py-4 text-black">Status</th>
              <th className="text-left px-6 py-4 text-black">Date</th>
              <th className="text-left px-6 py-4 text-black">Action</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-3 py-2 text-center">
                  <Loader2 /> Loading...
                </td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-2 text-center">
                  No complaints found.
                </td>
              </tr>
            ) : (
              complaints.map((complaint) => (
                <tr
                  key={complaint?._id || complaint?.email}
                  className="border-b"
                >
                  <td className="px-3 py-2">{complaint?.name || "-"}</td>
                  <td className="px-3 py-2">{complaint?.email || "-"}</td>
                  <td className="px-3 py-2">{complaint?.subject || "-"}</td>
                  <td className="px-3 py-2">{complaint?.message || "-"}</td>
                  <td className="px-3 py-2">
                    <p
                      className={`${getStatusBadgeClass(
                        complaint?.status,
                      )} inline-block whitespace-nowrap px-3 py-1 rounded-full text-sm`}
                    >
                      {complaint?.status || "Pending"}
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    {complaint?.createdAt
                      ? new Date(complaint.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-3 py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                        >
                          <EllipsisVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-40" align="start">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: complaint?._id,
                                status: "Pending",
                              })
                            }
                          >
                            Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: complaint?._id,
                                status: "Resolved",
                              })
                            }
                          >
                            Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: complaint?._id,
                                status: "In-Progress",
                              })
                            }
                          >
                            In-Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              deleteComplaintMutation.mutate(complaint?._id)
                            }
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Dashbord;
