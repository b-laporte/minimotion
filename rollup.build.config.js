import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

const createConfig = () => ({
  input: "src/core/index.ts",
  output: [
    {
      file: "dist/minimotion.js",
      format: "umd",
      name: "minimotion"
    },
    {
      file: "dist/minimotion.mjs",
      format: "esm"
    }
  ],
  plugins: [
    typescript({
      objectHashIgnoreUnknownHack: true,
      tsconfig: "tsconfig.build.json"
    })
  ]
});

const addMinification = config => {
  config.output.forEach(
    output => (output.file = output.file.replace(".", ".min."))
  );
  config.plugins.push(terser());
  return config;
};

export default [createConfig(), addMinification(createConfig())];
