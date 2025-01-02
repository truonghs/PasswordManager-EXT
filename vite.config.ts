import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'

export default defineConfig({
  plugins: [react(), viteStaticCopy({
    targets: [
      {
        src: 'public/manifest.json',
        dest: '.'
      },
      {
        src: 'src/assets/icons',
        dest: '.'
      },
      {
        src: 'src/assets/scripts',
        dest: '.'
      }
    ]
  }), sentryVitePlugin({
    org: "golden-owl-solutions",
    project: "gopass-extension"
  })],
  build: {
    outDir: 'build',

    rollupOptions: {
      input: {
        main: './index.html'
      }
    },

    sourcemap: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})