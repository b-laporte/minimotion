import typescript from "rollup-plugin-typescript2";
import copy from "rollup-plugin-copy";
import resolve from "rollup-plugin-node-resolve";
import gzip from "rollup-plugin-gzip";
import {terser} from "rollup-plugin-terser";
import svelte from "rollup-plugin-svelte";

export default {
  input: "src/demo/main.js",
  output: {
    file: "dist/demo/demo.js",
    sourcemap: true,
    format: "iife"
  },
  plugins: [
    copy({
      targets: [{ src: "src/demo/index.html", dest: "dist/" }]
    }),
    resolve({
      mainFields: ["module"],
      extensions: [".mjs", ".js", ".ts", ".svelte"]
    }),
    typescript({
      objectHashIgnoreUnknownHack: true
    }),
    svelte({
      css: function(css) {
        css.write("dist/demo/demo.css");
      }
    }),
    terser(),
    gzip()
  ]
};
