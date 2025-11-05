module.exports = {
  env: { node: true, browser: true, es2021: true, mocha: true },
  extends: ["eslint:recommended"],
  plugins: ["security"],
  overrides: [],
  rules: {
    "security/detect-object-injection": "warn",
    "security/detect-unsafe-regex": "warn",
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    "eqeqeq": ["error", "always"]
  }
}
