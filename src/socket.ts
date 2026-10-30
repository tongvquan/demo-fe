import { io, type Socket } from "socket.io-client";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
export function createJoinSocket(): Socket {
  return io(`${SOCKET_URL}/join`, { transports: ["websocket", "polling"] });
}

export function createSocket(): Socket {
  return io(SOCKET_URL, { transports: ["websocket", "polling"] });
}

export function createMessageSocket(userId: string): Socket {
  return io(`${SOCKET_URL}/message`, {
    auth: { userId },
    transports: ["websocket", "polling"],
  });
}
