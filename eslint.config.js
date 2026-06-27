import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import relay from 'eslint-plugin-relay';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['**/dist/**', '**/node_modules/**', '**/__generated__/**']),
  
  // --- Global TS Rules (Applies to BFF and Frontend) ---
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    }
  },

  // --- Frontend Specific Rules ---
  {
    files: ['frontend/src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'relay': relay,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      
      // Enforce Absolute Imports for Frontend
      'no-restricted-imports': ['error', {
        'patterns': [{
          'group': ['./*', '../*'],
          'message': 'Please use absolute imports starting with "@ch/" instead of relative paths.'
        }]
      }],

      // Relay Logic
      ...relay.configs.recommended.rules,
    },
  },

  // --- BFF Specific Rules ---
  {
    files: ['bff/src/**/*.ts'],
    rules: {
      // Enforce Absolute Imports for BFF
      'no-restricted-imports': ['error', {
        'patterns': [{
          'group': ['./*', '../*'],
          'message': 'Please use absolute imports starting with "@bff/" instead of relative paths.'
        }]
      }],
    }
  }
]);
