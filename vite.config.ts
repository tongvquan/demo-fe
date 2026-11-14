import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl = env.VITE_DEV_BACKEND_URL;
  const proxy = {
    "/api": {
      target: backendUrl,
      changeOrigin: true,
      secure: false,
    },
    "/socket.io": {
      target: backendUrl,
      changeOrigin: true,
      secure: false,
      ws: true,
    },
  };

  return {
    plugins: [react()],
    ...(backendUrl
      ? {
          server: { proxy },
          preview: { proxy },
        }
      : {}),
  };
});
