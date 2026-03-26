import app from "./app";
import { envVars } from "./app/config/env";
import { seedSystemAdmin } from "./app/seed/systemAdmin.seed";

const bootstrap = async () => {
  try {
    await seedSystemAdmin();
    app.listen(envVars.PORT, () => {
      console.log(`Turf Server is running on ${envVars.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

bootstrap();
