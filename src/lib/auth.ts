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

  baseURL: process.env.BETTER_AUTH_URL,

  trustedOrigins: [process.env.APP_URL!, "http://localhost:3000"],

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: "select_account consent",
      // accessType: "offline",
    },
  },

  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "USER", required: false },
      phone: { type: "string", required: false },
      status: { type: "string", defaultValue: "ACTIVE", required: false },
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
  },

  advanced: {
    cookies: {
      session_token: {
        name: "session_token",
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          partitioned: true,
        },
      },
      state: {
        name: "oauth_state",
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
