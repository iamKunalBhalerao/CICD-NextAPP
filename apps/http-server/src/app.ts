import express, { Request, Response, type Express } from "express";
import cors from "cors";

const app: Express = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.get("/health", (_req: Request, res: Response) => {
  res.send("OK");
});

export default app;
