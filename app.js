import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/user.routes.js"; // Import the auth routes
import employeeRoutes from "./routes/employe.routes.js";

const app = express();

// Setup to access the permission of the cors (uncomment if you have custom CORS options)
// import { corsOptions } from "./config/config.js";
// app.use(cors(corsOptions));

// Middleware for debugging incoming requests (optional)
// app.use((req, res, next) => {
//     console.log('Incoming request:', req.body, req.file);
//     next();
// });
app.use(
  cors({
    origin: "http://localhost:5173/", // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent
  })
);
// Middleware configuration
app.use(express.json({ limit: "30kb" })); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Parses URL-encoded data
app.use(express.static("public")); // Serve static files from the "public" directory

// To access and set the user server cookies
app.use(cookieParser());

// Routes for authentication (login and register)
app.use("/api/auth", authRoutes); // Set up authentication routes at "/api/auth"
app.use("/api", employeeRoutes);

export { app };
