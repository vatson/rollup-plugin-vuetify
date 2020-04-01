#!/usr/bin/env node

const { resolve } = require("path");
const { rollup } = require("rollup");
const vue = require("rollup-plugin-vue");
const commonjs = require("@rollup/plugin-commonjs");

const resolveNode = require("@rollup/plugin-node-resolve");
const typescript = require("@rollup/plugin-typescript");
const typescript2 = require("rollup-plugin-typescript2");
const postcss = require("rollup-plugin-postcss");

const plugin = require("../src/plugin");

const build = async () => {
  try {
    const bundleTs = await rollup({
      input: resolve(__dirname, "src/index.js"),
      external: ["vue", "vuetify/lib"],
      plugins: [
        resolveNode(),
        commonjs(),
        postcss(),
        vue(),
        typescript({
          lib: ["es5", "es6", "ESNext", "dom"],
          target: "ESNext",
          tsconfig: resolve(__dirname, "tsconfig.json"),
        }),
        plugin(),
      ],
    });

    bundleTs.write({ format: "esm", file: resolve(__dirname, "dist/ts.js") });

    const bundleTs2 = await rollup({
      input: resolve(__dirname, "src/index.js"),
      external: ["vue", "vuetify/lib"],
      plugins: [
        resolveNode(),
        commonjs(),
        postcss(),
        vue(),
        typescript2({
          objectHashIgnoreUnknownHack: true,
          tsconfig: resolve(__dirname, "tsconfig.json"),
        }),
        plugin(),
      ],
    });

    bundleTs2.write({ format: "esm", file: resolve(__dirname, "dist/ts2.js") });
  } catch (e) {
    console.log(e);
  }
};

build();
