import { io } from "socket.io-client";
const URL = "https://mw.artwear.ge";

export const socket = io(URL, {
  transports: ["websocket"],
  secure: true,
});
