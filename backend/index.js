import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

// Import routes
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import mfaRoutes from "./routes/mfa.routes.js";
import barangayClearanceRoutes from "./routes/barangay.clearance.routes.js";
import barangayIndigencyRoutes from "./routes/barangay.indigency.routes.js";
import incidentReportRoutes from "./routes/incident.report.routes.js";
import cedulaRoutes from "./routes/cedula.routes.js";
import businessClearanceRoutes from "./routes/business.clearance.routes.js";
import blotterReportRoutes from "./routes/blotter.report.routes.js";
import userRoutes from "./routes/user.routes.js";
import documentRequestRoutes from "./routes/document.request.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import logRoutes from "./routes/log.routes.js";
import transactionHistoryRoutes from "./routes/transaction.history.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import officialsRoutes from "./routes/official.routes.js";
import upcomingEventsRoutes from "./routes/upcoming.events.routes.js";
import residentRoutes from "./routes/resident.routes.js";
import treasurerRoutes from "./routes/treasurer.routes.js";

const app = express();
dotenv.config();

// Configure CORS before other middleware
app.use(
    cors({
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "withcredentials",
            "Accept",
            "Origin",
            "X-Requested-With",
        ],
        exposedHeaders: ["Content-Range", "X-Content-Range"],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204,
    })
);

// Add OPTIONS handling for preflight requests
app.options("*", cors());

// Increase payload limits
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Optimize MongoDB connection settings
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
            socketTimeoutMS: 45000,
            maxPoolSize: 50,
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        // Don't exit process, just log error
        console.log("Retrying connection in 5 seconds...");
        setTimeout(connectDB, 5000);
    }
};

// Connect to MongoDB with retry mechanism
const connectWithRetry = () => {
    console.log("Attempting to connect to MongoDB...");
    connectDB();
};

// Initial connection
connectWithRetry();

// Handle MongoDB connection errors
mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
    console.log("Retrying connection in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
});

mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected. Attempting to reconnect...");
    setTimeout(connectWithRetry, 5000);
});

// Run server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});

// Create error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error!";
    res.status(
        statusCode.json({
            success: false,
            message,
            statusCode,
        })
    );
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/mfa", mfaRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/barangay-clearance", barangayClearanceRoutes);
app.use("/api/barangay-indigency", barangayIndigencyRoutes);
app.use("/api/incident-report", incidentReportRoutes);
app.use("/api/cedula", cedulaRoutes);
app.use("/api/business-clearance", businessClearanceRoutes);
app.use("/api/blotter", blotterReportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/document-requests", documentRequestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/transaction-history", transactionHistoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/officials", officialsRoutes);
app.use("/api/upcoming-events", upcomingEventsRoutes);
app.use("/api/residents", residentRoutes);
app.use("/api/treasurer", treasurerRoutes);

export default app;
