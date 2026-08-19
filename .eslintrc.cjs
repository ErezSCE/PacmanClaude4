module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  plugins: ['react', '@typescript-eslint'],
  settings: { react: { version: 'detect' } },
  ignorePatterns: ['dist', 'node_modules', 'playwright-report', 'test-results'],
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
};
