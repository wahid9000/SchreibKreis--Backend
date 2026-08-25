import nodemailer from "nodemailer";
import {
  buildDigestEmail,
  buildVerificationEmail,
  buildWelcomeEmail,
  DigestPost,
} from "./mailTemplates";

const defaultAppName = process.env.APP_NAME || "Schreibkreis";
const senderName = process.env.EMAIL_FROM_NAME || defaultAppName;
const senderEmail = process.env.EMAIL_FROM;

export const transporter = nodemailer.createTransport({
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

export type SendDigestMailOptions = {
  users: Array<{ email: string; name: string | null }>;
  posts: DigestPost[];
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

  async sendDigestMail({
    users,
    posts,
    appName = defaultAppName,
  }: SendDigestMailOptions) {
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

    if (!smtpUser || !smtpPassword) {
      console.warn(
        "SMTP credentials are not configured. Digest emails were not sent.",
      );
      return { sent: 0, failed: users.length, totalUsers: users.length };
    }

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        const template = buildDigestEmail({
          appName,
          name: user.name,
          posts,
        });

        await transporter.sendMail({
          from: `"${senderName}" <${senderEmail}>`,
          to: user.email,
          subject: template.subject,
          text: template.text,
          html: template.html,
        });
        sent++;
      } catch (error) {
        console.error(`Failed to send digest to ${user.email}:`, error);
        failed++;
      }
    }

    return { sent, failed, totalUsers: users.length };
  },
};
