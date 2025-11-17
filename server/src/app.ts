import express from 'express';
import cors from "cors";
import heroRoutes from "./routes/heroRoutes.js";
import missionRoutes from "./routes/missionRoutes.js";
import defaultsRoutes from "./routes/defaultsRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api", heroRoutes);
app.use("/api", missionRoutes);
app.use("/api", defaultsRoutes);
app.use("/api", uploadRoutes);
app.use("/api", mediaRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;

