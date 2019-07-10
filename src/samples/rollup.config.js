
import typescript from 'rollup-plugin-typescript2';
import gzip from "rollup-plugin-gzip";
import {terser} from 'rollup-plugin-terser';

export default {
  input: "src/samples/samples.ts",
  output: {
    file: "dist/samples/samples.js",
    sourcemap: true,
    format: "cjs"
  },
  plugins: [typescript(), terser(), gzip()], // , terser() , gzip()
  external: ['typescript']
};

