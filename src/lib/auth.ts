import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailService } from "./emailService";
import { prisma } from "./prisma";

const appName = process.env.APP_NAME || "Schreibkreis";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigin: process.env.APP_URL || "http://localhost:5000",
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
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
  },
});
