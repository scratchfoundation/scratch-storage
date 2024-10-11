module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: ['scratch', 'scratch/es6', 'scratch/node'],
    env: {
        node: true,
        browser: false
    },
    overrides: [
        {
            files: ['**/*.ts', '**/*.tsx'],
            extends: ['plugin:@typescript-eslint/recommended'],
            rules: {
                'no-use-before-define': 'off',
                '@typescript-eslint/no-use-before-define': 'error'
            }
        }
    ]
};
