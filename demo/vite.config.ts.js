// vite.config.ts
import path from "path";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import RollupPluginDotenv from "rollup-plugin-dotenv";
import RollupPluginPolyfillNode from "rollup-plugin-polyfill-node";
import { defineConfig } from "vite";
import EnvironmentPlugin from "vite-plugin-environment";
var result = dotenv.config();
console.log({ env: result.parsed });
var vite_config_default = defineConfig({
  plugins: [react(), EnvironmentPlugin(Object.keys(result.parsed))],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve("/Users/hedongliu/Documents/GitHub/pyra-sdk/demo", "./src")
    }
  },
  build: {
    target: "es2020",
    rollupOptions: {
      plugins: [
        RollupPluginPolyfillNode({
          include: null
        }),
        RollupPluginDotenv()
      ]
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true
        })
      ]
    }
  },
  server: {
    port: 1234,
    host: "0.0.0.0"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmltcG9ydCB7IE5vZGVHbG9iYWxzUG9seWZpbGxQbHVnaW4gfSBmcm9tIFwiQGVzYnVpbGQtcGx1Z2lucy9ub2RlLWdsb2JhbHMtcG9seWZpbGxcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBkb3RlbnYgZnJvbSBcImRvdGVudlwiO1xuaW1wb3J0IFJvbGx1cFBsdWdpbkRvdGVudiBmcm9tIFwicm9sbHVwLXBsdWdpbi1kb3RlbnZcIjtcbmltcG9ydCBSb2xsdXBQbHVnaW5Qb2x5ZmlsbE5vZGUgZnJvbSBcInJvbGx1cC1wbHVnaW4tcG9seWZpbGwtbm9kZVwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBFbnZpcm9ubWVudFBsdWdpbiBmcm9tIFwidml0ZS1wbHVnaW4tZW52aXJvbm1lbnRcIjtcblxuY29uc3QgcmVzdWx0ID0gZG90ZW52LmNvbmZpZygpO1xuY29uc29sZS5sb2coeyBlbnY6IHJlc3VsdC5wYXJzZWQgfSk7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBFbnZpcm9ubWVudFBsdWdpbihPYmplY3Qua2V5cyhyZXN1bHQucGFyc2VkKSldLFxuICByZXNvbHZlOiB7XG4gICAgZGVkdXBlOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiXSxcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShcIi9Vc2Vycy9oZWRvbmdsaXUvRG9jdW1lbnRzL0dpdEh1Yi9weXJhLXNkay9kZW1vXCIsIFwiLi9zcmNcIilcbiAgICAgIC8vIGJ1ZmZlcjogXCJyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy9idWZmZXItZXM2XCIsIC8vIGFkZCBidWZmZXJcbiAgICB9XG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgdGFyZ2V0OiBcImVzMjAyMFwiLFxuICAgIC8vIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBwbHVnaW5zOiBbXG4gICAgICAgIC8vIEVuYWJsZSByb2xsdXAgcG9seWZpbGxzIHBsdWdpblxuICAgICAgICAvLyB1c2VkIGR1cmluZyBwcm9kdWN0aW9uIGJ1bmRsaW5nXG4gICAgICAgIFJvbGx1cFBsdWdpblBvbHlmaWxsTm9kZSh7XG4gICAgICAgICAgaW5jbHVkZTogbnVsbFxuICAgICAgICB9KSxcbiAgICAgICAgLy8gcHJvdmlkZXIgLmVudiB0byBwcm9jZXNzLmVudiAob25seSBBVkFJTEFCTEUgaW4gUFJPRCBtb2RlKVxuICAgICAgICBSb2xsdXBQbHVnaW5Eb3RlbnYoKVxuICAgICAgXVxuICAgIH1cbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgIC8vIEVuYWJsZSBlc2J1aWxkIHBvbHlmaWxsIHBsdWdpbnNcbiAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgTm9kZUdsb2JhbHNQb2x5ZmlsbFBsdWdpbih7XG4gICAgICAgICAgcHJvY2VzczogdHJ1ZSxcbiAgICAgICAgICBidWZmZXI6IHRydWVcbiAgICAgICAgfSlcbiAgICAgIF0gYXMgYW55W11cbiAgICB9XG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDEyMzQsXG4gICAgaG9zdDogXCIwLjAuMC4wXCJcbiAgfVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQUE7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLElBQU0sU0FBUyxPQUFPO0FBQ3RCLFFBQVEsSUFBSSxFQUFFLEtBQUssT0FBTztBQUUxQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsU0FBUyxrQkFBa0IsT0FBTyxLQUFLLE9BQU87QUFBQSxFQUN4RCxTQUFTO0FBQUEsSUFDUCxRQUFRLENBQUMsU0FBUztBQUFBLElBQ2xCLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLG1EQUFtRDtBQUFBO0FBQUE7QUFBQSxFQUl6RSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFFUixlQUFlO0FBQUEsTUFDYixTQUFTO0FBQUEsUUFHUCx5QkFBeUI7QUFBQSxVQUN2QixTQUFTO0FBQUE7QUFBQSxRQUdYO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJTixjQUFjO0FBQUEsSUFDWixnQkFBZ0I7QUFBQSxNQUVkLFNBQVM7QUFBQSxRQUNQLDBCQUEwQjtBQUFBLFVBQ3hCLFNBQVM7QUFBQSxVQUNULFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBS2hCLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQTtBQUFBOyIsCiAgIm5hbWVzIjogW10KfQo=
