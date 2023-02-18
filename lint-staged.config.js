export default {
    '*.{js,ts}': ['eslint --fix', 'eslint'],
    '**/*.ts?(x)': () => 'npm run check-types',
    '*.{js,ts,json,yml}': ['prettier --write']
};
