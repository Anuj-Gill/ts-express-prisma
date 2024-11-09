// src/types/session.d.ts
import "express-session";

declare module "express-session" {
  interface SessionData {
    user?: any; // Replace `any` with a more specific type if possible
    refresh_token?: string;
  }
}
