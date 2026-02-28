import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      // Prevents app.listen() from being called during tests
      VERCEL: '1',
    },
  },
});
