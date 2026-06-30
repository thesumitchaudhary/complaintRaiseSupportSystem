import bcrypt from "bcrypt";
import crypto from "crypto";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import complaints from "../model/complaints.js";
import userModel from "../model/userModel.js";
import {
  sendAdminMail,
  sendEmailVerificationCodeTemplate,
  sendForgotPasswordMail,
  sendMail,
  sendStatusUpdateMail,
  sendWelcomeMailTemplate,
} from "../helper/sendMail.js";

dotenv.config();

export const createUser = async (req, res) => {
  try {
    const { name, email, password, confirmedPassword } = req.body;

    if (!name || !email || !password || !confirmedPassword) {
      return res.status(401).json({
        success: false,
        message: "name, email, password and confirmedPassword are required",
      });
    }

    if (password != confirmedPassword) {
      return res.status(401).json({
        success: false,
        message: "hey the password is not match",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "user is already registered",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const code = Math.floor(100000 + Math.random() * 99999);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      verificationCode: code,
    });

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    await sendEmailVerificationCodeTemplate({
      name: user.name,
      email: user.email,
      verificationCode: user.verificationCode,
    });

    return res.status(201).json({
      success: true,
      message: "user created successfully",
      result: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server Error",
      result: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { code, email } = req.body;

    if (code) {
      const user = await userModel.findOne({
        verificationCode: code,
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or Expired Code",
        });
      }

      user.verified_at = Date.now();
      user.verificationCode = undefined;
      await user.save();
      await sendWelcomeMailTemplate(user.email, user.name);

      return res.status(200).json({
        success: true,
        message: "Email verified successfully",
        result: { id: user._id, name: user.name, email: user.email },
      });
    }

    if (email) {
      const user = await userModel.findOne({ email });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Email not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Email exists",
        user,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Email or code required",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server Error",
      result: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are mandatory",
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "password does not match",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET not configured");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      jwtSecret
    );
    const cookieOptions = { httpOnly: true, sameSite: "lax", path: "/" };
    res.cookie("token", token, cookieOptions);

    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: "login successful",
      result: userObj,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server Error",
      error: error.message,
    });
  }
};

export const getFilteredTicketDetails = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { date, startDate, endDate, search, page, limit } = req.query;
    const shouldPaginate = page !== undefined || limit !== undefined;
    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(Number.parseInt(limit, 10) || 10, 1),
      50
    );

    const filter = {
      customerId,
    };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      filter.raisedDate = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    } else if (startDate && endDate) {
      const start = new Date(startDate);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filter.raisedDate = {
        $gte: start,
        $lte: end,
      };
    }

    const searchText = String(search || "").trim();

    if (searchText) {
      const escapedSearchText = searchText.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const searchRegex = new RegExp(escapedSearchText, "i");

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
        { status: searchRegex },
        { serviceType: searchRegex },
      ];
    }

    const ticketQuery = complaints
      .find(filter)
      .select("name email subject message serviceType raisedDate status createdAt")
      .sort({ raisedDate: -1, _id: -1 });

    if (shouldPaginate) {
      ticketQuery.skip((pageNumber - 1) * pageSize).limit(pageSize);
    }

    const statsFilter = {
      ...filter,
      customerId: new mongoose.Types.ObjectId(customerId),
    };

    const [tickets, complaintStats] = await Promise.all([
      ticketQuery.lean(),
      complaints.aggregate([
        { $match: statsFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            resolved: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["completed", "resolved"]] },
                  1,
                  0,
                ],
              },
            },
            active: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["assigned", "in_progress"]] },
                  1,
                  0,
                ],
              },
            },
            pending: {
              $sum: {
                $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    const {
      total: totalComplaints = 0,
      resolved: resolvedComplaints = 0,
      active: activeComplaints = 0,
      pending: pendingComplaints = 0,
    } = complaintStats[0] || {};

    const totalPages = shouldPaginate
      ? Math.max(Math.ceil(totalComplaints / pageSize), 1)
      : 1;

    return res.status(200).json({
      success: true,
      count: tickets.length,
      total: totalComplaints,
      result: tickets,
      stats: {
        total: totalComplaints,
        resolved: resolvedComplaints,
        active: activeComplaints,
        pending: pendingComplaints,
      },
      pagination: {
        page: shouldPaginate ? pageNumber : 1,
        limit: shouldPaginate ? pageSize : totalComplaints,
        total: totalComplaints,
        totalPages,
        hasNextPage: shouldPaginate && pageNumber < totalPages,
        hasPreviousPage: shouldPaginate && pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("Filter Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", { path: "/" });

    return res.status(200).json({
      success: true,
      message: "user logout successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server is error",
    });
  }
};

export const getReassignedComplaints = async (req, res) => {
  try {
    const reassignedComplaints = await complaints
      .find({
        "assignmentHistory.status": "reassigned",
      })
      .populate("customerId", "name email")
      .populate("assignedEmployee", "name email")
      .populate("assignmentHistory.employee", "name email")
      .populate("assignmentHistory.assignedBy", "name");

    return res.status(200).json({
      success: true,
      count: reassignedComplaints.length,
      complaints: reassignedComplaints,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const raiseTicket = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { name, email, subject, message, serviceType } = req.body || {};

    if (!name || !email || !subject || !message || !serviceType) {
      return res.status(400).json({
        success: false,
        message: "name, email, subject, message, and serviceType are mandatory",
      });
    }

    const user = await userModel.findOne({ _id: customerId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const createdTicket = await complaints.create({
      customerId,
      name,
      email,
      subject,
      message,
      serviceType,
      raisedDate: Date.now(),
    });

    await sendMail(email, name, subject, message);
    await sendAdminMail(email, name, subject, message);

    return res.status(200).json({
      success: true,
      message: "Ticket raised successfully",
      result: createdTicket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create ticket",
      error: error.message,
    });
  }
};

export const handleForgotPassword = async (req, res) => {
  try {
    const email = req.body?.email || req.query?.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email is mandatory",
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user is not found",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordToken = token;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    await sendForgotPasswordMail({
      email: user.email,
      name: user.name,
      resetUrl,
    });

    return res.status(200).json({
      success: true,
      message: "password reset link sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const id = req.user.id;

    const user = await userModel.findOne({ _id: id });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "hey user is not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "user fetched successfully",
      result: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body || {};

    if (!email || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "email, token and newPassword are required",
      });
    }

    let user = await userModel.findOne({ resetPasswordToken: token });

    if (!user) {
      user = await userModel.findOne({ email, resetPasswordToken: token });
    }

    if (!user) {
      console.debug("ResetPassword: no user found for token", { token, email });
      return res.status(400).json({
        success: false,
        message: "Invalid token or email",
      });
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires.getTime() < Date.now()) {
      console.debug("ResetPassword: token expired", {
        token,
        email,
        expires: user.resetPasswordExpires,
      });
      return res.status(400).json({
        success: false,
        message: "Token has expired",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getTickets = async (req, res) => {
  try {
    const tickets = await complaints
      .find()
      .populate("customerId")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, result: tickets });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
    });
  }
};

const normalizeTicketStatus = (incomingStatus = "") => {
  const value = String(incomingStatus).trim().toLowerCase();

  if (value === "pending") return "pending";
  if (value === "accepted") return "accepted";
  if (["inprogress", "in-progress", "in progress", "in_progress"].includes(value)) {
    return "in_progress";
  }
  if (["resolved", "completed"].includes(value)) return "completed";
  if (value === "assigned") return "assigned";
  if (value === "rejected") return "rejected";

  return "";
};

export const updateTicket = async (req, res) => {
  try {
    const { status } = req.body;
    const ticketId = req.params.id;
    const normalizedStatus = normalizeTicketStatus(status);
    const shouldSetAcceptedDate =
      normalizedStatus === "accepted" || normalizedStatus === "in_progress";

    if (!normalizedStatus) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const updatedTicket = await complaints
      .findByIdAndUpdate(
        ticketId,
        {
          status: normalizedStatus,
          ...(shouldSetAcceptedDate ? { acceptedDate: Date.now() } : {}),
        },
        { returnDocument: "after", runValidators: true }
      )
      .populate("customerId", "name email");

    if (!updatedTicket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const customerName = updatedTicket.customerId?.name || updatedTicket.name;
    const customerEmail = updatedTicket.customerId?.email || updatedTicket.email;

    if (customerName && customerEmail) {
      await sendStatusUpdateMail(
        customerName,
        customerEmail,
        updatedTicket.subject,
        updatedTicket.message,
        updatedTicket.status
      );
    }

    return res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      result: updatedTicket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      result: error.message,
    });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;

    const deletedTicket = await complaints.findByIdAndDelete(ticketId);

    if (!deletedTicket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
      result: deletedTicket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      result: error.message,
    });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token");

    return res.status(200).json({
      success: true,
      message: "Logout is successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
