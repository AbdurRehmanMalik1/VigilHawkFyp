import io from "socket.io-client";

const SOCKET_URL ="http://localhost:8000";
const socket = io(SOCKET_URL, { transports: ["websocket"] });

socket.on("connect", () => console.log("Socket connected", socket.id));
socket.on("connect_error", (err:any) => console.warn("Socket connect_error", err));

export default socket;