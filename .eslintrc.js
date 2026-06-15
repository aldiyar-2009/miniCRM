module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": "off",
  },
  overrides: [
    {
      files: ["public/**/*.js"],
      env: {
        browser: true,
        es2021: true,
      },
      globals: {
        API_BASE: "readonly",
        io: "readonly",
        getToken: "readonly",
        requireAuth: "readonly",
        renderNav: "readonly",
        getUser: "readonly",
        apiFetch: "readonly",
        formatDateTime: "readonly",
        showToast: "readonly",
        showAlert: "readonly",
        Sortable: "readonly",
        clearTokens: "readonly",
        markNotifRead: "readonly",
      },
    },
  ],
};
