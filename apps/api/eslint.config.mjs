import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'prisma/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    rules: {
      // Nest constructor injection and DTO classes trip this rule constantly.
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // TODO(B1): companies.service.ts still has `any` casts. Flip to 'error' once removed.
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  }
);
