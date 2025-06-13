const google = require("eslint-config-google");
const prettier = require("eslint-config-prettier");
const prettierPlugin = require("eslint-plugin-prettier");

console.log("Loading ESLint config with plugins:", { prettier: !!prettierPlugin });

module.exports = [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        browser: true,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...google.rules,
      ...prettier.rules,
      "no-unused-vars": ["off", { vars: "all", args: "none" }], // Warn instead of error, ignore unused args
      semi: ["error", "always"],
      quotes: ["error", "double"],
      indent: "off",
      "require-jsdoc": "off",
      "valid-jsdoc": "off",
      "max-len": "off", // Disable max-len to prevent line length conflicts
      "prettier/prettier": [
        "error",
        {
          semi: true,
          singleQuote: false,
          tabWidth: 2,
          trailingComma: "es5",
          printWidth: 120, // Match .prettierrc
          bracketSpacing: true,
          arrowParens: "avoid",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    ignores: ["index.html"],
  },
];
