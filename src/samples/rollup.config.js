
import typescript from 'rollup-plugin-typescript2';
import gzip from "rollup-plugin-gzip";
import minify from 'rollup-plugin-minify-es';

export default {
  input: "src/samples/samples.ts",
  output: {
    file: "dist/samples/samples.js",
    sourcemap: true,
    format: "cjs"
  },
  plugins: [typescript(), minify(), gzip()], // , minify() , gzip()
  external: ['typescript']
};

