import { io, type Socket } from "socket.io-client";
import { SOCKET_PATH, SOCKET_URL } from "./config";

export { SOCKET_URL };

export function createJoinSocket(): Socket {
  return io(`${SOCKET_URL}/join`, { path: SOCKET_PATH, transports: ["websocket", "polling"] });
}

export function createSocket(): Socket {
  return io(SOCKET_URL || undefined, { path: SOCKET_PATH, transports: ["websocket", "polling"] });
}

export function createMessageSocket(userId: string): Socket {
  return io(`${SOCKET_URL}/message`, {
    auth: { userId },
    path: SOCKET_PATH,
    transports: ["websocket", "polling"],
  });
}
