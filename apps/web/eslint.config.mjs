import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

export default tseslint.config(
  { ignores: ['dist/**', '.angular/**', 'node_modules/**'] },
  {
    files: ['src/**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended],
    // Templates are inline in the components, so lint them through the TS processor.
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // TODO(W0): services still return Observable<any>. Flip to 'error' once typed with shared DTOs.
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  },
  {
    files: ['src/**/*.html'],
    extends: [...angular.configs.templateRecommended]
    // TODO(W5): add angular.configs.templateAccessibility during the polish pass.
  }
);
