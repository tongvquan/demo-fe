import { io, type Socket } from "socket.io-client";
const configuredSocketUrl = import.meta.env.VITE_SOCKET_URL || "https://dugout-likeness-dislike.ngrok-free.dev";
export const SOCKET_URL = configuredSocketUrl.replace(/\/+$/, "");
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
