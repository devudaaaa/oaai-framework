import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps asset paths relative, so a single build runs on a GitHub
// Pages project subpath and on devudaaaa.xyz without reconfiguration.
export default defineConfig({
  plugins: [react()],
  base: './',
});
