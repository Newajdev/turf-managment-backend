import { Role } from "../../generated/prisma/enums";
import { envVars } from "../config/env";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export const seedSystemAdmin = async () => {
  try {
    const adminEmail = envVars.ADMIN_EMAIL; 
    const adminPassword = envVars.ADMIN_PASSWORD; 
    const adminName = envVars.ADMIN_NAME 
    const adminContact = envVars.ADMIN_CONTACT; 
    const adminPhoto = envVars.ADMIN_PHOTO; 

    const isExist = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (isExist) {
      console.log("System Admin already exists...");
      return;
    }

    const data = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        role: Role.SYSTEM_ADMIN,
        needPasswordChange: false,
      },
    });

    if (!data.user) {
      console.error("Failed to seed System Admin authentication user.");
      return;
    }

    await prisma.systemAdmin.create({
      data: {
        userId: data.user.id,
        name: adminName,
        email: adminEmail,
        contactNumber: adminContact,
        profilePhoto: adminPhoto,
      },
    });

    console.log("System Admin seeded successfully!");
  } catch (error) {
    console.error("Error seeding System Admin:", error);
  }
};
