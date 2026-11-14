const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

export const API_URL = trimTrailingSlashes(import.meta.env.VITE_API_URL || "/api");

// An empty socket URL makes socket.io connect to the current frontend origin.
const configuredSocketUrl = import.meta.env.VITE_SOCKET_URL?.trim() || "";
export const SOCKET_URL = configuredSocketUrl === "/"
  ? ""
  : trimTrailingSlashes(configuredSocketUrl);

// Socket.IO has its own Nginx location and is not under /api.
export const SOCKET_PATH = import.meta.env.VITE_SOCKET_PATH || "/socket.io";

