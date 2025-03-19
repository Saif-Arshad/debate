// socket.js
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
    transports: ["websocket"], // optional, ensures a websocket-only connection
});

export default socket;
