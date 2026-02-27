import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      closeBundle() {
        copyFileSync(
          resolve(__dirname, 'public/manifest.json'),
          resolve(__dirname, 'dist/manifest.json')
        )
        try {
          copyFileSync(
            resolve(__dirname, 'public/icon.png'),
            resolve(__dirname, 'dist/icon.png')
          )
        } catch (e) {
          console.warn('Icon not found, skipping...')
        }
        try {
          copyFileSync(
            resolve(__dirname, 'src/crm-ui/crm-theme.css'),
            resolve(__dirname, 'dist/crm-theme.css')
          )
        } catch (e) {
          console.warn('CRM theme CSS not found, skipping...')
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    minify: false,
    rollupOptions: {
      input: {
        contentScript: resolve(__dirname, 'src/contentScript.ts'),
        background: resolve(__dirname, 'src/background.ts'),
        side_panel: resolve(__dirname, 'side_panel.html'),
      },
      output: {
        entryFileNames: (chunk) => (chunk.name === 'side_panel' ? 'sidepanel.js' : '[name].js'),
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
})
