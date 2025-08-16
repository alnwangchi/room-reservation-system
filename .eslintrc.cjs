module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'unused-imports'],
  rules: {
    // 未使用導入檢查
    'no-unused-vars': 'off', // 關閉原生規則，使用 unused-imports 的規則
    'unused-imports/no-unused-imports': 'error', // 檢查未使用的導入
    'unused-imports/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    // 檢查使用了但沒有 import 的錯誤
    'no-undef': 'error',
    // 檢查 React 相關的未定義變數
    'react/jsx-no-undef': 'error',
    // 檢查 JSX 中的未定義變數
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    // 關閉一些過於嚴格的 React 規則
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
