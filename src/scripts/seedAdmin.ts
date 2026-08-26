import { prisma } from "../lib/prisma";

export async function seedAdmin() {
  try {
    const adminData = {
      email: process.env.ADMIN_EMAIL || "admin@email.com",
      name: process.env.ADMIN_NAME || "Admin User",
      role: process.env.ADMIN_ROLE || "ADMIN",
      password: process.env.ADMIN_PASSWORD || "admin123",
    };

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminData.email as string },
    });

    if (existingAdmin) {
      throw new Error("Admin user already exists.");
    }

    const signUpAdmin = await fetch(
      `${process.env.BETTER_AUTH_URL}/api/auth/sign-up/email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: process.env.BETTER_AUTH_URL || "http://localhost:3000",
        },
        body: JSON.stringify(adminData),
      },
    );
    const responseBody = await signUpAdmin.text();

    if (!signUpAdmin.ok) {
      throw new Error(
        `Admin signup failed (${signUpAdmin.status}): ${responseBody}`,
      );
    }

    if (signUpAdmin.ok) {
      await prisma.user.update({
        where: { email: adminData.email as string },
        data: { emailVerified: true },
      });
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}

seedAdmin();
