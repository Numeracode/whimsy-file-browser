import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      chonky: resolve(__dirname, '../chonky/src/index.ts'),
    },
  },
});
