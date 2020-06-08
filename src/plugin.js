const { createFilter } = require("rollup-pluginutils");
const load = require("./load");
const extract = require("./extract");
const transform = require("./transform");

const externalScriptTemplate = new Map();

const extractAndTransform = (code, template) => {
  // If template exists, extract component and directives
  if (template) {
    let { directives, components } = extract(template)
    return transform(code, components, directives)
  } else {
    // If vue component uses render() function https://vuejs.org/v2/guide/render-function.html
    // then template does not exist, thus transforming only code.
    return transform(code)
  }
}

const filter = createFilter(/.*\.vue/);

module.exports = (options = {}) => {
  return {
    async transform(code, id) {
      if (externalScriptTemplate.has(id)) {
        return extractAndTransform(code, externalScriptTemplate.get(id));
      } else if (filter(id)) {
        const source = await load(id);

        if (source.isExternalScript) {
          externalScriptTemplate.set(source.scriptPath, source.template);
          return;
        } 
        else if (/\.*vue\?((?!map).)*$/i.test(id) || !source.script) {
          if (typeof source.script === 'string' && source.script.trim() === '') {
            code = 'export default {}';
          }

          return extractAndTransform(code, source.template);
        }
      }
    },
  };
};
