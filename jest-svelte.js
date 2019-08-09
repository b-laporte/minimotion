const svelte = require("svelte/compiler");

exports.process = function(source, filename) {
  return svelte.compile(source, {
    filename,
    format: "cjs"
  }).js;
};
