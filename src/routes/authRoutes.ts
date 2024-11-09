// src/routes/authRoutes.ts
import { Router } from "express";
import {
  getGoogleAuthUrl,
  googleAuthCallback,
  signup,
} from "../controllers/authController";

const router = Router();

// Endpoint to get Google auth URL
router.get("/google/url", getGoogleAuthUrl);

// Callback endpoint for Google OAuth
router.get("/google/callback", googleAuthCallback);

// Endpoint for normal signup
router.post("/signup", signup);

export default router;
