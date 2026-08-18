export type VerificationEmailOptions = {
  appName: string;
  url: string;
  brandColor?: string;
};

export type WelcomeEmailOptions = {
  appName: string;
  firstName?: string | undefined;
  brandColor?: string;
};

export function buildVerificationEmail({
  appName,
  url,
  brandColor = "#2563eb",
}: VerificationEmailOptions) {
  const subject = `Verify your email for ${appName}`;

  const text = [
    "Hello,",
    "",
    `Thanks for signing up for ${appName}.`,
    "Please verify your email address by clicking the link below:",
    url,
    "",
    "Thanks,",
    appName,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; background: #ffffff;">
        <div style="margin-bottom: 20px;">
          <h2 style="margin: 0 0 12px; color: #111827;">Verify your email</h2>
          <p style="margin: 0; color: #374151;">Hello,</p>
        </div>

        <p style="margin: 0 0 16px; color: #374151;">
          Thanks for signing up for <strong>${appName}</strong>.
        </p>

        <p style="margin: 0 0 20px; color: #374151;">
          Please verify your email address by clicking the button below:
        </p>

        <p style="margin: 0 0 20px;">
          <a
            href="${url}"
            style="display: inline-block; background: ${brandColor}; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600;"
          >
            Verify Email
          </a>
        </p>

        <p style="margin: 0 0 8px; color: #374151;">
          If the button does not work, use this link:
        </p>

        <p style="margin: 0 0 20px; word-break: break-all;">
          <a href="${url}" style="color: ${brandColor};">${url}</a>
        </p>

        <p style="margin: 0; color: #374151;">
          Thanks,<br />
          <strong>${appName}</strong>
        </p>
      </div>
    </div>
  `;

  return { subject, text, html };
}

export function buildWelcomeEmail({
  appName,
  firstName,
  brandColor = "#16a34a",
}: WelcomeEmailOptions) {
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";
  const subject = `Welcome to ${appName}`;

  const text = [
    greeting,
    "",
    `Your email has been verified successfully, and your account is now active.`,
    "",
    `Welcome to ${appName}! We’re glad to have you on board.`,
    "",
    "Thanks,",
    appName,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; background: #ffffff;">
        <div style="margin-bottom: 20px;">
          <h2 style="margin: 0 0 12px; color: #111827;">Welcome aboard</h2>
          <p style="margin: 0; color: #374151;">${greeting}</p>
        </div>

        <p style="margin: 0 0 16px; color: #374151;">
          Your email has been verified successfully, and your account is now active.
        </p>

        <p style="margin: 0 0 20px; color: #374151;">
          Welcome to <strong>${appName}</strong>! We’re glad to have you with us.
        </p>

        <p style="margin: 0 0 20px;">
          <a
            href="${process.env.APP_URL || "http://localhost:5000"}"
            style="display: inline-block; background: ${brandColor}; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600;"
          >
            Go to ${appName}
          </a>
        </p>

        <p style="margin: 0; color: #374151;">
          Thanks,<br />
          <strong>${appName}</strong>
        </p>
      </div>
    </div>
  `;

  return { subject, text, html };
}
