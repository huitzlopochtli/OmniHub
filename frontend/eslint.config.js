// @ts-check
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  // ── Ignore generated / third-party dirs ──────────────────────────────────
  {
    ignores: ['dist/**', 'dev-dist/**', 'node_modules/**', 'public/**'],
  },

  // ── Base JS recommended ───────────────────────────────────────────────────
  js.configs.recommended,

  // ── TypeScript recommended (no type-checked to keep lint fast) ───────────
  ...tseslint.configs.recommended,

  // ── React + hooks ─────────────────────────────────────────────────────────
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // React (new JSX transform — no need to import React)
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,

      // Hooks
      ...reactHooks.configs.recommended.rules,

      // Fast refresh
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // Disabled: API response shapes are often genuinely unknown; prefer
      // explicit `unknown` + narrowing in new code but don't block the build.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',

      // react-hooks/set-state-in-effect: new in v5, flags some valid patterns
      // (e.g. accumulating mounted panels). Keep as warn for visibility.
      'react-hooks/set-state-in-effect': 'warn',

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },

  // ── Prettier must be last — disables style rules that conflict ────────────
  prettierConfig,
)
