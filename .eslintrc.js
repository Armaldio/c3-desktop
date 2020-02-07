module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
    '@vue/typescript',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // 'import/core-modules': ['electron']
    'import/no-extraneous-dependencies': ['error', {'devDependencies': true}]
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
};
