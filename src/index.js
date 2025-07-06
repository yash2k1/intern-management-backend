import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./db/connect.js";
import setupRoutes from "./router.js";

dotenv.config({ path: "./env" });

// Variables
const app = express();
const PORT = process.env.PORT || "8081";

// __dirname setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB connection
connectDB()
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });

// middleware

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies (for form submissions, including multer uploads)
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(
  cors({
    origin: "*", // allow all origins, adjust for production
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    // credentials: true,
  })
);

// Serve static files from uploads folder for images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request logger middleware
app.use((req, res, next) => {
  res.on("finish", () => {
    console.log(`✅ ${res.statusCode} ${req.method} ${req.originalUrl}`);
  });
  next();
});

// Setup your app routes (including multer middleware inside your routes)
setupRoutes(app);

// Root route
app.get("/", (req, res) => {
  res.send("hello server");
});

// Start server
app.listen(PORT, () => {
  try {
    console.log(`Our server is live at http://localhost:${PORT}`);
  } catch (error) {
    console.log(`there is some error ${error}`);
  }
});
