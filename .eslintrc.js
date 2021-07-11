module.exports = {
    root: true,
    extends: ['@sprylab/eslint-config'],
    parserOptions: {
        project: './tsconfig.json',
    },
    rules: {
        'sonarjs/cognitive-complexity': ['error', 20],
    },
};
