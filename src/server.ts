import { Server } from "http";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSystemAdmin } from "./app/seed/systemAdmin.seed";
import { startBackgroundJobs } from "./app/jobs";

let server: Server;

const bootstrap = async () => {
  try {
    await seedSystemAdmin();

    startBackgroundJobs();

    const PORT = process.env.PORT || envVars.PORT || 5000;

    server = app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

bootstrap();
