import express from 'express';
import cors from "cors";
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { getDatabase } from './config/database.js';
import heroRoutes from "./routes/heroRoutes.js";
import missionRoutes from "./routes/missionRoutes.js";
import defaultsRoutes from "./routes/defaultsRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { requireAuth } from "./middleware/authMiddleware.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: process.env.MONGO_DB_NAME || 'gogo-impact-report',
      touchAfter: 24 * 3600, // lazy session update
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    },
  })
);

// Auth routes (public)
app.use("/api/auth", authRoutes);

// All routes (GET is public, PUT/POST are protected by middleware in route files)
app.use("/api", heroRoutes);
app.use("/api", missionRoutes);
app.use("/api", defaultsRoutes);
app.use("/api", uploadRoutes);
app.use("/api", mediaRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;

