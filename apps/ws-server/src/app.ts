import "dotenv/config";
import { WebSocketServer } from "ws";
import { prisma } from "@repo/db";
import bcrypt from "bcrypt";

const wss = new WebSocketServer({ port: 8080 });

wss.on("listening", () => console.log("Listining..."));

wss.on("connection", async (socket) => {
  const email = `user${(Math.random() * 1000).toFixed()}@user.com`;
  const password = "pass@123";
  const res = await prisma.user.create({
    data: {
      email,
      password,
    },
  });
  socket.send(`user created ${res}`);
  socket.send("Hi their you are connected to server!");

  socket.on("message", (data: string) => {
    const parsedData = JSON.parse(data.toString());

    if (parsedData.type == "chat") {
      socket.send(parsedData.msg);
    }
  });
});
