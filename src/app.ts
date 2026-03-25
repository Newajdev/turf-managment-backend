import express, { Application, Request, Response } from "express";
import { IndexRoutes } from "./app/routes";
import { prisma } from "./app/lib/prisma";



const app: Application = express();

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

app.use("/api/v1", IndexRoutes);

// base route
app.get("/", async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const SportsType = await prisma.sportType.create({
    data: {
      title: "Football"
    }
  })
  res.status(201).json({
    success: true,
    message: "",
  });
});

export default app;
