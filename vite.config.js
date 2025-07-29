import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [vue(), vuetify()],
  server: { port: 5190 },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'docs',
  },
  base: mode === 'production' ? '/grid-surface-warper/' : '/'    
}))
