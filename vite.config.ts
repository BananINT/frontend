import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import audioManifest from './vite-plugins/audio-manifest'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), audioManifest()],
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "./src"),
    },
  },
})
