import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a reusable transporter object using the default SMTP transport
let transporter: nodemailer.Transporter | null = null;

export const initEmailService = async () => {
    if (transporter) return transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log(`📧 SMTP initialized: ${process.env.SMTP_HOST}`);
    } else {
        throw new Error("SMTP credentials missing in .env file. Please provide SMTP_HOST, SMTP_USER, and SMTP_PASS.");
    }

    return transporter;
}

export const sendEmail = async (to: string, subject: string, html: string, senderName?: string) => {
    const transport = await initEmailService();

    if (!transport) throw new Error("Email transporter not initialized");

    const fromName = senderName || process.env.SMTP_FROM_NAME || 'ReachInbox Scheduler';
    const fromEmail = process.env.SMTP_USER;

    if (!fromEmail) throw new Error("SMTP_USER is not defined in environment variables");

    const info = await transport.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
    });

    console.log(`📨 Message sent: ${info.messageId}`);
    return info;
};
