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
    server = app.listen(envVars.PORT, () => {
      console.log(`Server is running on http://localhost:${envVars.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

bootstrap();
