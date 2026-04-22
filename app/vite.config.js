import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Opt-in bundle visualizer. Run `ANALYZE=1 npm run build` to emit dist/stats.html.
const plugins = [react()]
if (process.env.ANALYZE) {
  const { visualizer } = await import('rollup-plugin-visualizer')
  plugins.push(
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap'
    })
  )
}

export default defineConfig({
  plugins,
  server: {
    port: 5173,
    open: false
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-router/') ||
              id.includes('/react-router-dom/') ||
              id.includes('/scheduler/')
            ) {
              return 'react-vendor'
            }
            if (
              id.includes('/@supabase/realtime-js/') ||
              id.includes('/@supabase/functions-js/') ||
              id.includes('/@supabase/storage-js/') ||
              id.includes('/phoenix/')
            ) {
              return 'supabase-extras'
            }
            if (id.includes('/@supabase/')) {
              return 'supabase'
            }
          }
        }
      }
    }
  }
})
