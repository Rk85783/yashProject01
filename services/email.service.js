import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a transporter for SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

transporter.verify().then(() => {
    console.log("Server is ready to take our messages");
}).catch((err) => {
    console.error("Error verifying transporter", err);
});

export const sendMail = async ({ to, subject, variables, emailTemplate }) => {
    try {
        const htmlContent = await ejs.renderFile(path.resolve(__dirname, `../views/emails/${emailTemplate}`), variables);

        const info = await transporter.sendMail({
            from: `"YashProject01" <${process.env.SMTP_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            // text: "Hello world?", // plain text body
            // html: "<b>Hello world?</b>", // html body
            html: htmlContent, // html template
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (err) {
        console.error("Error while sending mail", err);
    }
};