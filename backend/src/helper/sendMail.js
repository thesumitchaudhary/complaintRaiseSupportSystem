import transporter from "./sendVerificationMail.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

import { sendConfirmEmailTemplate } from "../template/sendConfirmEmailTemplate.js";

import { sendTicketRaisedEmailToAdminTemplate } from "../template/sendTicketRaisedEmailToAdminTemplate.js";

import { sendTicketStatusTemplate } from "../template/sendTicketStatusTemplate.js";

import { sendEmailVerificationCodeTemplate } from "../template/sendEmailVerificationCodeTemplate.js"

dotenv.config();

const sendverificationCodeMail = async (email, verficationCode) => {
    try {

        const template =
            typeof sendEmailVerificationCodeTemplate === "function"
                ? sendEmailVerificationCodeTemplate()
                : String(sendEmailVerificationCodeTemplate);

        const html = template
            .replace("{email}", email)
            .replace("{verficationCode}", verficationCode);

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

export { sendMail, sendAdminMail, sendStatusUpdateMail };