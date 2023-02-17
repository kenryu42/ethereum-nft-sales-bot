export default {
    '*.{js,ts}': ['eslint --fix', 'eslint'],
    '**/*.ts?(x)': () => 'npm run check-types',
    '*.{json,yaml}': ['prettier --write']
};
