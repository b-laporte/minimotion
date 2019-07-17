module.exports = {
  overrides: [
    {
      files: ["**/*.svelte"],
      processor: "svelte3/svelte3",
      settings: {
        "svelte3/ignore-warnings": warning =>
          warning.code === "a11y-invalid-attribute"
      }
    }
  ],
  plugins: ["svelte3"],
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint"
  ],
  rules: {
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/explicit-member-accessibility": 0,
    "@typescript-eslint/no-parameter-properties": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-use-before-define": 0,
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "none"
      }
    ]
  }
};
