import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: 'src/registration.js',
      output: {
        entryFileNames: 'registration.bundle.js',
        format: 'iife',
        name: 'RegistrationBundle',
      },
    },
    outDir: 'dist',
  },
})

