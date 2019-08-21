const debug = require("debug");
const { createFilter } = require("rollup-pluginutils");
const load = require("./load");
const extract = require("./extract");
const transform = require("./transform");

const dT = debug("rollup-plugin-vuetify:transform");

const externalScriptTemplate = new Map();

module.exports = (options = {}) => {
  const filter = createFilter(/.*\.vue/);

  return {
    async transform(code, id) {
      let template;

      if (externalScriptTemplate.has(id)) {
        template = externalScriptTemplate.get(id);
      } else if (filter(id)) {
        const source = await load(id);

        if (source.isExternalScript) {
          externalScriptTemplate.set(source.scriptPath, source.template);
          return;
        } else if (!/\?.*$/.test(id)) {
          return;
        }

        template = source.template;
      }

      if (template) {
        const { directives, components } = extract(template);

        dT(transform(code, components, directives));

        // console.log(
        //   id,
        //   "\r\n",
        //   code,
        //   "\r\n",
        //   JSON.stringify(this.parse(code), null, 2)
        // );
        // Object.values(this.parse(code).body).map(n => {
        // console.log(n.type);
        // if (n.type == "ImportDeclaration") {
        // console.log("opa", n);
        // }
        // });
      }
    }
  };
};
