import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Only apply middleware to routes we handle
  // This prevents Express from intercepting routes meant for the proxy
  
  // Example API routes - only handle specific routes
  // Other /api routes will pass through to Vite's proxy
  app.get("/api/ping", express.json(), (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", express.json(), handleDemo);

  return app;
}
