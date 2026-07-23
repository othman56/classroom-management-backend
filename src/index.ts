import express, { Request, Response, NextFunction } from "express";

const app = express();
const PORT = 8000;

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Root GET route
app.get("/", (_req: Request, res: Response) => {
  res.send("Hello from Classroom Management backend");
});

const server = app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}/`);
});

export default server;
