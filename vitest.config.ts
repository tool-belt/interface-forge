import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            reporter: ['text', 'lcov'],
        },
        globals: true,
        include: ['tests/**/*.spec.ts'],
    },
});
