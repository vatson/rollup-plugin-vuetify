const { createFilter } = require("rollup-pluginutils");
const load = require("./load");
const extract = require("./extract");
const transform = require("./transform");

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

        return transform(code, components, directives);
      }
    },
  };
};
