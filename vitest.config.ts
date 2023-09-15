// eslint-disable-next-line import/no-unresolved
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        include: ['tests/**/*.spec.ts'],
        coverage: {
            reporter: ['text', 'lcov'],
        },
    },
});
