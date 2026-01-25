import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
//import { resolve } from "path" // Import this!

export default defineConfig({
  base: "/",
  plugins: [react(), tsconfigPaths()],
//  resolve: {
//    alias: {
//      "@chakra-ui/react": resolve(__dirname, "../../packages/react/src"),
//    },
//  },
  preview: {
    port: 3333,
    strictPort: true,
  },
  server: {
    port: 3333,
    strictPort: true,
    host: true
  }
})
