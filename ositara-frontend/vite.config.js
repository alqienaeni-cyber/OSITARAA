import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Mengarahkan hasil build langsung ke folder public Laravel
    outDir: '../public',
    // Wajib false agar file index.php dan .htaccess Laravel tidak terhapus!
    emptyOutDir: false,
  },
})