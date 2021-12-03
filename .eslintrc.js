module.exports = {
    root: true,
    extends: ['@tool-belt/eslint-config'],
    parserOptions: {
        project: './tsconfig.json',
    },
    rules: {
        'sonarjs/cognitive-complexity': ['error', 20],
    },
};
