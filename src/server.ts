import app from "./app";

const bootstrap = () => {
  try {
    app.listen(5000, () => {
      console.log(`Turf Server is running on http://localhost:5000`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

bootstrap();
