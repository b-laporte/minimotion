import typescript from "rollup-plugin-typescript2";
import copy from "rollup-plugin-copy";
import resolve from "rollup-plugin-node-resolve";
import gzip from "rollup-plugin-gzip";
import { terser } from "rollup-plugin-terser";
import svelte from "rollup-plugin-svelte";
import postcss from 'rollup-plugin-postcss';
import { promises as fs } from "fs";
import * as Prism from 'prismjs';
import 'prismjs/components/prism-javascript';

const SOURCE_PREFIX = "source:";
const SOURCE_SUFFIX = ".src";
const demoSourceCodePlugin = {
  async load(id) {
    if (id.startsWith(SOURCE_PREFIX) && id.endsWith(SOURCE_SUFFIX)) {
      const fileId = id.substring(
        SOURCE_PREFIX.length,
        id.length - SOURCE_SUFFIX.length
      );
      let source = await fs.readFile(fileId, "utf8");
      source = source.replace(/^[\s\S]*(async function animation)/, '$1');
      source = source.replace(/<\/script>[\s\S]*$/, '');
      source = Prism.highlight(source, Prism.languages.javascript, 'javascript');
      return `export default ${JSON.stringify(source)};`;
    }
    return null;
  },
  async resolveId(id, importer) {
    if (id.startsWith(SOURCE_PREFIX)) {
      const fileId = id.substr(SOURCE_PREFIX.length);
      const resolveResult = await this.resolve(fileId, importer);
      return SOURCE_PREFIX + resolveResult.id + SOURCE_SUFFIX;
    }
    return null;
  }
};

export default {
  input: "src/demo/main.ts",
  output: {
    file: "dist/demo/demo.js",
    sourcemap: true,
    format: "iife"
  },
  plugins: [
    demoSourceCodePlugin,
    copy({
      targets: [{ src: "src/demo/index.html", dest: "dist/" }]
    }),
    resolve({
      mainFields: ["module"],
      extensions: [".mjs", ".js", ".ts", ".svelte"]
    }),
    typescript({
      objectHashIgnoreUnknownHack: true,
      tsconfig: "tsconfig.demo.json"
    }),
    svelte({
      css: function(css) {
        css.write("dist/demo/demo.css");
      }
    }),
    postcss(),
    terser(),
    gzip()
  ]
};
