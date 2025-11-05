// eslint.config.js (CommonJS)
const js = require("@eslint/js");
const pluginSecurity = require("eslint-plugin-security");

module.exports = [
  {
    ignores: [
      "node_modules",
      "public",
      "cypress/videos",
      "cypress/screenshots",
      "eslint.config.js",
      ".eslintrc.*"
    ]
  },
  js.configs.recommended,
  {
    plugins: { security: pluginSecurity },
    rules: {
      "security/detect-object-injection": "warn",
      "security/detect-unsafe-regex": "warn",
      "eqeqeq": ["error", "always"],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-console": "off"
    }
  },
  {
    files: [
      "server.js",
      "app.js",
      "libs/**/*.js",
      "test/**/*.js",
      "cypress.config.js",
      "*.cjs",
      "*.js"
    ],
    languageOptions: {
      globals: {
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        process: "readonly",
        console: "readonly",
        URL: "readonly"
      }
    }
  },
  {
    files: ["cypress/**/*.cy.js", "cypress/**/*.spec.js", "cypress/**/*.js"],
    languageOptions: {
      globals: {
        cy: "readonly",
        Cypress: "readonly",
        describe: "readonly",
        it: "readonly",
        beforeEach: "readonly",
        before: "readonly",
        afterEach: "readonly",
        after: "readonly",
        expect: "readonly"
      }
    },
    rules: {
      "security/detect-object-injection": "off"
    }
  },
  {
    files: ["test/**/*.js"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        before: "readonly",
        beforeEach: "readonly",
        after: "readonly",
        afterEach: "readonly",
        expect: "readonly"
      }
    }
  }
];
