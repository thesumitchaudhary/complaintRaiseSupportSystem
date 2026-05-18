import transporter from "./sendVerificationMail.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

import { sendConfirmEmailTemplate } from "../template/sendConfirmEmailTemplate.js";

import { sendTicketRaisedEmailToAdminTemplate } from "../template/sendTicketRaisedEmailToAdminTemplate.js";

import { sendTicketStatusTemplate } from "../template/sendTicketStatusTemplate.js";

import { sendEmailVerificationCodeTemplate as renderEmailVerificationCodeTemplate } from "../template/sendEmailVerificationCodeTemplate.js";

import { sendWelcomeEmailTemplate as renderWelcomeEmailTemplate } from "../template/sendWelcomeEmailTemplate.js";

dotenv.config();

const sendEmailVerificationCodeTemplate = async ({ name, email, verificationCode }) => {
    try {
        const html = renderEmailVerificationCodeTemplate(verificationCode);

        await transporter.sendMail({
            from: `"Support System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify your email address",
            text: `Hi ${name}, your verification code is ${verificationCode}.`,
            html,
        });


    } catch (err) {
        console.error("Error while sending user mail:", err);
    }
};

const sendWelcomeMailTemplate = async (email, name) => {
    try {
        const html = renderWelcomeEmailTemplate(name);

        await transporter.sendMail({
            from: `"Support System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Welcome to Support Desk",
            text: `Welcome to Support Desk, ${name}. Your account is now verified.`,
            html,
        });


    } catch (err) {
        console.error("Error while sending user mail:", err);
    }
};
    
const sendForgotPasswordMail = async ({ email, name, resetUrl }) => {
    try {
        const html = `
            <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
                <div style="background: linear-gradient(135deg, #0f172a, #1d4ed8); padding: 28px; border-radius: 14px; color: #fff; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">Reset your password</h1>
                    <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">Support System account recovery</p>
                </div>
                <div style="background: #fff; margin-top: 20px; padding: 28px; border-radius: 14px; color: #334155; line-height: 1.6;">
                    <p style="font-size: 16px; margin-top: 0;">Hi ${name},</p>
                    <p style="font-size: 15px; color: #475569;">We received a request to reset the password for your account. Use the button below to set a new password.</p>
                    <div style="text-align: center; margin: 28px 0;">
                        <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 14px 24px; border-radius: 10px; font-weight: bold;">Reset password</a>
                    </div>
                    <p style="font-size: 13px; color: #64748b;">If you did not request this change, you can ignore this email. This link expires soon for your security.</p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"Support System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Reset your password",
            text: `Hi ${name}, reset your password here: ${resetUrl}`,
            html,
        });
    } catch (err) {
        console.error("Error while sending forgot password mail:", err);
    }
};


const sendMail = async (email, name, subject, message) => {
    try {

        const template =
            typeof sendConfirmEmailTemplate === "function"
                ? sendConfirmEmailTemplate()
                : String(sendConfirmEmailTemplate);

        const html = template
            .replace("{name}", name)
            .replace("{subject}", subject)
            .replace("{message}", message);

        const info = await transporter.sendMail({
            from: `"Support System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            text: message,
            html,
        });


    } catch (err) {
        console.error("Error while sending user mail:", err);
    }
};

const sendAdminMail = async (email, name, subject, message) => {
    try {

        const template =
            typeof sendTicketRaisedEmailToAdminTemplate === "function"
                ? sendTicketRaisedEmailToAdminTemplate()
                : String(sendTicketRaisedEmailToAdminTemplate);

        const html = template
            .replace("{name}", name)
            .replace("{email}", email)
            .replace("{subject}", subject)
            .replace("{message}", message);

        const info = await transporter.sendMail({
            from: `"Support System" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `New Ticket Raised - ${subject}`,
            text: message,
            html,
        });


    } catch (err) {
        console.error("Error while sending admin mail:", err);
    }
};

const sendStatusUpdateMail = async (name, email, subject, message, status) => {
    try {

        const template =
            typeof sendTicketStatusTemplate === "function"
                ? sendTicketStatusTemplate()
                : String(sendTicketStatusTemplate);

        const html = template
            .replace("{name}", name)
            .replace("{email}", email)
            .replace("{subject}", subject)
            .replace("{message}", message)
            .replace("{status}", status);

        const info = await transporter.sendMail({
            from: `"Support System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Ticket Status Updated - ${subject}`,
            text: `Your ticket status is now: ${status}\n\n${message}`,
            html,
        });


    } catch (err) {
        console.error("Error while sending status update mail:", err);
    }
};

export { sendMail, sendAdminMail, sendStatusUpdateMail, sendEmailVerificationCodeTemplate, sendWelcomeMailTemplate, sendForgotPasswordMail };