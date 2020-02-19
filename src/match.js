const {
  directives: vuetifyDirectives,
  components: vuetifyComponents,
} = require("vuetify-loader/lib/matcher/generator");
const { hyphenate, capitalize, camelize } = require("vuetify-loader/lib/util");

const normalize = items =>
  items.map(item => ({
    kebab: hyphenate(item),
    camel: capitalize(camelize(item)),
  }));

const getDirectives = attrs => {
  return normalize(attrs)
    .filter(({ camel }) => vuetifyDirectives.includes(camel.slice(1)))
    .map(({ camel }) => camel.slice(1));
};

const getComponents = tags => {
  return normalize(tags)
    .filter(
      ({ kebab, camel }) =>
        kebab.startsWith("v-") && vuetifyComponents.has(camel),
    )
    .map(({ camel }) => camel);
};

module.exports = {
  getDirectives,
  getComponents,
};
