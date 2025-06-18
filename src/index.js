import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db/connect.js";
import setupRoutes from "./Router.js";

dotenv.config({path:'./env'});


// variables
const app = express();
const PORT = process.env.PORT || "8081";

// DB connection
connectDB()
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173", // ✅ Vite dev server
    // methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    // allowedHeaders: ["Content-Type", "Authorization"],
    // credentials: true,
  })
);
app.use(express.json());
// ───────────────── Request logger ─────────────────
app.use((req, res, next) => {
  console.log(`✅ ${res.statusCode} ${req.method} ${req.originalUrl}`);
  next();
});
// ───────────────────────────────────────────────────

setupRoutes(app);

// Routes
app.get("/", (req, res) => {
  res.send("hello server");
});

// listen
app.listen(PORT, () => {
  try {
    console.log(`Our server is live at http://localhost:${PORT}`);
  } catch (error) {
    console.log(`there is some error ${error}`);
  }
});
