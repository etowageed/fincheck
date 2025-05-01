module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: ["airbnb-base", "plugin:node/recommended"],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    // Customize rules as needed
    "no-console": "off", // Allow console.* (common in backends)
    "node/no-unsupported-features/es-syntax": "off", // Allow modern syntax if using Babel/ESM
    "func-names": "off",
    "no-underscore-dangle": "off", // Useful for Express (e.g., `_id`)
    "consistent-return": "off", // Let you return conditionally
  },
};
