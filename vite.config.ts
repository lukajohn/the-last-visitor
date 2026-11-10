import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/the-last-visitor/' : '/',
  build: {
    target: 'es2022',
    sourcemap: false,
    assetsInlineLimit: 4096,
  },
});
