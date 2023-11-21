import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({ jsxRuntime: "automatic" })],
  resolve: {
    alias: {
      react: path.posix.resolve("src/react"),
      "react-dom": path.posix.resolve("src/react-dom"),
      "react-dom-bindings": path.posix.resolve("src/react-dom-bindings"),
      "react-reconciler": path.posix.resolve("src/react-reconciler"),
      scheduler: path.posix.resolve("src/scheduler"),
      shared: path.posix.resolve("src/shared"),
    },
  },
  define: {
    __DEV__: false, // 代码中大量的if (__DEV__)这种判断没什么意义，因此改成false
    __EXPERIMENTAL__: true,
    __PROFILE__: true,
  },
  optimizeDeps: {
    force: true,
  },
  server: {
    port: "8899",
  },
});
