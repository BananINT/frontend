import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Layout lab: renders casino pages against stubbed context/socket so shifts can
// be measured in a headless browser. Not part of the app build.
export default defineConfig({
  root: path.resolve(__dirname, 'lab'),
  plugins: [react()],
  server: { port: 5199 },
  resolve: {
    alias: [
      { find: /^@app\/context\/GameContext$/, replacement: path.resolve(__dirname, './lab/stubs/GameContext.tsx') },
      { find: /^@app\/lib\/socket$/, replacement: path.resolve(__dirname, './lab/stubs/socket.ts') },
      { find: /^@app\/context\/AuthContext$/, replacement: path.resolve(__dirname, './lab/stubs/AuthContext.tsx') },
      { find: /^@app\/utils\/confetti$/, replacement: path.resolve(__dirname, './lab/stubs/confetti.ts') },
      { find: /^@app\/lib\/api$/, replacement: path.resolve(__dirname, './lab/stubs/api.ts') },
      { find: '@app', replacement: path.resolve(__dirname, './src') },
    ],
  },
})
