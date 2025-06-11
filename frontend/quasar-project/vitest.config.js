// vitest.config.js
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true, // Omogućava da funkcije poput `describe`, `it`, `expect` budu globalno dostupne
  },
});
