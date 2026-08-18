import nodemailer from "nodemailer";
import { buildVerificationEmail, buildWelcomeEmail } from "./mailTemplates";

const defaultAppName = process.env.APP_NAME || "Schreibkreis";
const senderName = process.env.EMAIL_FROM_NAME || defaultAppName;
const senderEmail = process.env.EMAIL_FROM;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
  },
});

export type SendVerificationEmailOptions = {
  to: string;
  url: string;
  appName?: string;
};

export type SendWelcomeEmailOptions = {
  to: string;
  appName?: string;
  firstName?: string | undefined;
};

export const emailService = {

  async sendVerificationEmail({
    to,
    url,
    appName = defaultAppName,
  }: SendVerificationEmailOptions) {
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

    if (!smtpUser || !smtpPassword) {
      console.warn(
        "SMTP credentials are not configured. Verification email was not sent.",
      );
      console.log(`Verification link for ${to}: ${url}`);
      return null;
    }

    const template = buildVerificationEmail({
      appName,
      url,
      brandColor: process.env.APP_BRAND_COLOR || "#2563eb",
    });

    return transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  },

  async sendWelcomeEmail({
    to,
    appName = defaultAppName,
    firstName,
  }: SendWelcomeEmailOptions) {
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

    if (!smtpUser || !smtpPassword) {
      console.warn(
        "SMTP credentials are not configured. Welcome email was not sent.",
      );
      return null;
    }

    const template = buildWelcomeEmail({
      appName,
      firstName,
      brandColor: process.env.APP_BRAND_COLOR || "#16a34a",
    });

    return transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  },
};
