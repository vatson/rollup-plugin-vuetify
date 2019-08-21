#!/usr/bin/env node

const path = require("path");
const debug = require("debug");

const bl = debug("before:load");
const br = debug("before:resolve");
const al = debug("after:load");
const ar = debug("after:resolve");
const at = debug("after:transform");

const { rollup } = require("rollup");
const vue = require("rollup-plugin-vue");
const commonjs = require("rollup-plugin-commonjs");

const ts = require("rollup-plugin-typescript2");
const postcss = require("rollup-plugin-postcss");

const { parseComponent } = require("vue-template-compiler");

const plugin = require("./plugin");

const before = {
  load(id) {
    // bl(arguments)
    // if (/.*\.vue$/.test(id)) {
    //   const code = require(path.resolve(id))
    //   parseComponent()
    //   return
    // }
  },
  transform(code, id) {
    if (/.*(\.js|.vue).*/.test(id)) {
      bl(code + "!!!end", id);
      // console.log(parseComponent(code));
      // return { code: code + "<style>hop: { color: red }</style>" };
    }
  }
  // resolveId(id) {
  //   br(arguments)
  //   if (/.*\.vue/.test(id)) {
  //     return id
  //   }
  // }
};

const after = {
  // load() {
  //   al(arguments);
  // },
  // resolveId(id) {
  //   ar(arguments);
  // },
  transform(code, id) {
    if (/.*?rollup-plugin-vue=script.js/.test(id)) {
      at(code, id);
      // return { code: code + "<style>hop: { color: red }</style>" };
    }
  }
};

const build = async () => {
  try {
    const bundle = await rollup({
      input: "src/index.js",
      external: ["vue", "vuetify/lib"],
      plugins: [
        commonjs(),
        postcss(),
        // before,
        vue(),
        ts({ objectHashIgnoreUnknownHack: true }),
        // after,
        plugin()
      ]
    });

    bundle.write({ format: "esm", file: "dist/bundle.js" });
  } catch (e) {
    console.log(e);
  }
};

build();
