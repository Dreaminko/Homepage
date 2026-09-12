import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  appType: 'mpa',
  // Keep hashed build output out of /assets/icons and /assets/images, which hold
  // unhashed legacy files that must stay on a short cache lifetime.
  build: { assetsDir: 'assets/build' },
});
