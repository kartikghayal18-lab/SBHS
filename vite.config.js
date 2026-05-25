import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "127.0.0.1",
    port: 8013,
  },
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "index.html"),
        admin: path.resolve(__dirname, "admin.html"),
        login: path.resolve(__dirname, "login.html"),
        teacher: path.resolve(__dirname, "teacher.html"),
        student: path.resolve(__dirname, "student.html"),
      },
    },
  },
});
