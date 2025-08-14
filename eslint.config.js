import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config([
  globalIgnores(['dist']),
  js.configs.recommended,
  // TypeScript recommended flat configs (array)
  ...tseslint.configs.recommended,
  // React hooks and Vite refresh
  reactHooks.configs['recommended-latest'],
  reactRefresh.configs.vite,
  // Project-specific settings for TS/TSX files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    }
  },
  // Enable Prettier as an ESLint rule and config
  prettierRecommended
]);
