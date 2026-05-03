module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  extends: ['airbnb-base'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.eslint.json',
      },
    },
  },
  overrides: [
    {
      files: ['*.ts', '**/*.ts'],
      extends: ['airbnb-typescript/base'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: __dirname,
      },
      rules: {
        'import/extensions': 'off',
        'import/no-extraneous-dependencies': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
      },
    },
    {
      files: ['*.vue', '**/*.vue'],
      extends: ['plugin:vue/vue3-recommended'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: null,
        tsconfigRootDir: __dirname,
        extraFileExtensions: ['.vue'],
      },
      rules: {
        'import/extensions': 'off',
        'import/no-extraneous-dependencies': 'off',
        'no-unused-vars': 'warn',
        'no-use-before-define': 'off',
        'vue/no-mutating-props': 'off',
        'vue/multi-word-component-names': 'off',
        'vue/valid-define-emits': 'off',
        'vue/return-in-computed-property': 'off',
        'vue/require-v-for-key': 'off',
      },
    },
    {
      files: ['*.js', '**/*.js'],
      extends: ['airbnb-base'],
      parserOptions: {
        project: null,
      },
    },
  ],
  rules: {
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'consistent-return': 'off',
    'max-len': 'off',
    'no-promise-executor-return': 'off',
    'no-use-before-define': 'off',
    'no-plusplus': 'off',
    'no-restricted-syntax': 'off',
    'prefer-destructuring': 'off',
    'no-param-reassign': 'off',
    'no-shadow': 'off',
    'default-case': 'off',
    'no-unused-vars': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
