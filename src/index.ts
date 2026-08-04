import express, { Request, Response, NextFunction } from "express";
import subjectRouter from "./routes/subject";
import cors from "cors";
import securityMiddleware from "./middleware/security";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app = express();
const PORT = 8000;

if (!process.env.FRONTEND_URL) {
  throw new Error("FRONTEND_URL is not set in .env file");
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use(securityMiddleware);

app.use("/api/subjects", subjectRouter);

app.use(express.json());

// Root GET route
app.get("/", (_req, res) => {
  res.send("Hello from Classroom Management backend");
});

const server = app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}/`);
});

export default server;
