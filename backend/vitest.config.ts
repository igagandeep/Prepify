import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    exclude: ['dist/**', 'node_modules/**'],
    silent: true,
    env: {
      // Prevents app.listen() from being called during tests
      VERCEL: '1',
    },
  },
});
