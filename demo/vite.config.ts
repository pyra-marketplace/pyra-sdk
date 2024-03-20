import path from "path";

import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import RollupPluginDotenv from "rollup-plugin-dotenv";
import RollupPluginPolyfillNode from "rollup-plugin-polyfill-node";
import { defineConfig } from "vite";
import EnvironmentPlugin from "vite-plugin-environment";

const result = dotenv.config();
console.log({ env: result.parsed });

export default defineConfig({
  plugins: [react(), EnvironmentPlugin(Object.keys(result.parsed))],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src")
      // buffer: "rollup-plugin-node-polyfills/polyfills/buffer-es6", // add buffer
    }
  },
  build: {
    target: "es2020",
    // sourcemap: true,
    rollupOptions: {
      plugins: [
        // Enable rollup polyfills plugin
        // used during production bundling
        RollupPluginPolyfillNode({
          include: null
        }),
        // provider .env to process.env (only AVAILABLE in PROD mode)
        RollupPluginDotenv()
      ]
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true
        })
      ] as any[]
    }
  },
  server: {
    port: 1234,
    host: "0.0.0.0"
  }
});
