const { compile } = require("vue-template-compiler");
const { getComponents, getDirectives } = require("./matcher");

module.exports = template => {
  let attrs = new Set();
  let tags = new Set();

  compile(template, {
    modules: [
      {
        postTransformNode: node => {
          node.attrsList.forEach(({ name }) => attrs.add(name));
          tags.add(node.tag);
        }
      }
    ]
  });

  return {
    directives: getDirectives([...attrs]),
    components: getComponents([...tags])
  };
};
