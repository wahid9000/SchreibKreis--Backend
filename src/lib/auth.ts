import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailService } from "./emailService";
import { prisma } from "./prisma";
import { oAuthProxy } from "better-auth/plugins";

const appName = process.env.APP_NAME || "Schreibkreis";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  baseURL: process.env.FRONTEND_URL,
  trustedOrigins: [process.env.FRONTEND_URL!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const url = `${process.env.APP_URL}/verify-email?token=${token}`;
      try {
        await emailService.sendVerificationEmail({
          to: user.email,
          url,
          appName,
        });
      } catch (error) {
        console.error("Error sending verification email:", error);
      }
    },
    afterEmailVerification: async (user) => {
      try {
        await emailService.sendWelcomeEmail({
          to: user.email,
          appName,
          firstName: user.name?.split(" ")[0],
        });
      } catch (error) {
        console.error("Error sending welcome email:", error);
      }
    },
    socialProviders: {
      google: {
        prompt: "select_account consent",
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        accessType: "offline",
      },
    },
  },
  advanced: {
    cookies: {
      session_token: {
        name: "session_token", // Force this exact name
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          partitioned: true,
        },
      },
      state: {
        name: "session_token", // Force this exact name
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          partitioned: true,
        },
      },
    },
  },

  plugins: [oAuthProxy()],
});
