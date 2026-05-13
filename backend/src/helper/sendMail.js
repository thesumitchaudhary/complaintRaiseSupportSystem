import transporter from "./sendVerificationMail.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

import { sendConfirmEmailTemplate } from "../template/sendConfirmEmailTemplate.js";

import { sendTicketRaisedEmailToAdminTemplate } from "../template/sendTicketRaisedEmailToAdminTemplate.js";

dotenv.config();

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

        console.log("User mail sent:", info.messageId);

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

        console.log("Admin mail sent:", info.messageId);

    } catch (err) {
        console.error("Error while sending admin mail:", err);
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

        console.log("Admin mail sent:", info.messageId);

    } catch (err) {
        console.error("Error while sending admin mail:", err);
    }
};

export { sendMail, sendAdminMail };