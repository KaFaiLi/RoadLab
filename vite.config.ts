import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
export default defineConfig({
  base: "/" + (process.env.GITHUB_REPOSITORY?.split("/")[1] || "RoadLab") + "/",
  plugins: [react(), tailwind()],
  test: { include: ["tests/*.test.{ts,tsx}"], environment: "jsdom" },
});
