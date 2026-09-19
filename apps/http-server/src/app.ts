import express, { Request, Response, type Express } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { prisma } from "@repo/db";
import jwt from "jsonwebtoken";

const app: Express = express();
const JWT_SECRET = process.env.JWT_SECRET || "pass";

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

app.post("/auth/signup", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const isExists = await prisma.user.findFirst({
    where: { email },
  });

  if (isExists) {
    return res.status(400).json({
      message: "User with this email is already Exists!",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
    },
  });

  const token = await jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET,
  );

  res.status(200).json({
    message: "Signed Up Successfully!",
    user,
    token,
  });
});

app.post("/auth/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    return res
      .status(404)
      .json({ message: "User with this email dones not exists!" });
  }

  const comparePassword = await bcrypt.compare(password, user!.password);

  if (!comparePassword) {
    res.status(404).json({
      message: "Invalid Credentials!",
    });
  }

  const token = await jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET,
  );

  res.status(200).json({
    message: "Signed In Successfully!",
    user: user,
    token,
  });
});

export default app;
