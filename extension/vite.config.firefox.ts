import { defineConfig } from 'vite'
import { resolve } from 'path'
import { copyFileSync } from 'fs'
import baseConfig from './vite.config'

// Firefox-specific configuration
export default defineConfig({
    ...baseConfig,
    plugins: [
        {
            name: 'copy-manifest-firefox',
            closeBundle() {
                console.log('Copying Firefox manifest...');
                copyFileSync(
                    resolve(__dirname, 'public/manifest.firefox.json'),
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
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: 'chunks/[name].[hash].js',
                assetFileNames: 'assets/[name].[ext]'
            }
        }
    }
})
