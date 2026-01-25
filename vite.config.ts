import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()]
  // resolve: {
  //   alias: {
  //     "@chakra-ui/react": resolve("..", "..", "packages/react/src"),
  //   },
  // },
})

export default defineConfig({
 base: "/",
 plugins: [react(),tsconfigPaths()],
 resolve: {
   alias: {
     "@chakra-ui/react": resolve("..", "..", "packages/react/src"),
 preview: {
  port: 3333,
  strictPort: true,
 },
 server: {
  port: 3333,
  strictPort: true,
  host: true,
  origin: "http://0.0.0.0:3333",
 },
});
