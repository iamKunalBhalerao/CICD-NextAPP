import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("listening", () => console.log("Listining..."));

wss.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("message", (data: string) => {
    const parsedData = JSON.parse(data.toString());
    console.log(parsedData);
  });
});
