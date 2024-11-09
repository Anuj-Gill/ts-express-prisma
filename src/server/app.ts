import express, { Application, Express } from "express";
import "dotenv/config";
import authRoutes from "../routes/authRoutes";
import cors from "cors";

export default function ExpressApp(): Application {
  const app: Application = express();
  app.use(cors({ origin: "http://localhost:5173", credentials: true }));
  app.use(express.json());

  app.use("/auth", authRoutes);

  app.get("/", (req, res) => {
    res.status(200).json({ message: "up" });
  });

  return app;
}
