module.exports = {
  env: {
    browser: false,
    es2021: true,
    mocha: true,
    node: true,
  },
  settings: {
    node: {
      resolvePaths: ["node_modules/@types"],
      tryExtensions: [".js", ".json", ".node", ".ts", ".d.ts"],
    },
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "standard",
    "plugin:prettier/recommended",
    "plugin:node/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    "node/no-unsupported-features/es-syntax": [
      "error",
      { ignores: ["modules"] },
    ],
    "node/no-unpublished-import": "off",
    "node/no-extraneous-import": "off",
    "no-unused-expressions": "off",
  },
};
