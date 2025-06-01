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
      semi: ["error", "always"],
      quotes: ["error", "double"],
      indent: "off", // Disable ESLint's indent rule to avoid conflicts with Prettier
      "require-jsdoc": "off",
      "valid-jsdoc": "off",
      "prettier/prettier": [
        "error",
        {
          semi: true,
          singleQuote: false,
          tabWidth: 2,
          trailingComma: "es5",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    ignores: ["index.html"],
  },
];
