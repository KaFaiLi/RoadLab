import ts from "typescript-eslint";
export default ts.config(
  { ignores: ["dist/**", "test-results/**", "playwright-report/**"] },
  ...ts.configs.recommended,
);
