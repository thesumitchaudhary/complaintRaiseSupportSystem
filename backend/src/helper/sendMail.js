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

export { sendMail, sendAdminMail, sendStatusUpdateMail, sendEmailVerificationCodeTemplate, sendWelcomeMailTemplate };