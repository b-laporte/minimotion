import typescript from 'rollup-plugin-typescript2';
// import gzip from "rollup-plugin-gzip";
// import {terser} from 'rollup-plugin-terser';

export default {
  input: "src/test/main.spec.ts",
  output: {
    file: "dist/test.js",
    sourcemap: true,
    format: "cjs"
  },
  plugins: [typescript()], // , terser() , gzip()
  external: ['mocha', 'typescript', 'assert']
};
