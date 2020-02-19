const j = require("jscodeshift");

const findImportTarget = ast => {
  let target = ast.find(j.ImportDeclaration, path =>
    path.source.value.startsWith("vuetify/lib"),
  );

  if (target.length === 0) {
    target = j.importDeclaration([], j.literal("vuetify/lib"));
    ast.get().node.program.body.unshift(target);

    return target;
  }

  return target.nodes()[0];
};

const injectImports = (importTarget, imports = []) => {
  const alreadyAdded = importTarget.specifiers
    .filter(path => path.type === j.ImportSpecifier.name)
    .map(path => path.local.name);

  const uniqImportSpecifiers = imports
    .filter(name => !alreadyAdded.includes(name))
    .map(name => j.importSpecifier(j.identifier(name)));

  importTarget.specifiers = [
    ...importTarget.specifiers,
    ...uniqImportSpecifiers,
  ];
};

const getDecorator = ast => {
  const assignment = ast.find(j.AssignmentExpression, {
    left: {
      type: "Identifier",
      name: "default_1",
    },
    right: {
      type: "CallExpression",
      callee: {
        property: {
          type: "Identifier",
          name: "__decorate",
        },
      },
    },
  });

  const call = assignment.find(j.CallExpression, {
    callee: {
      type: "Identifier",
      name: "Component",
    },
  });

  if (call.length) return call;

  assignment
    .find(j.Identifier, { name: "Component" })
    .replaceWith(_ =>
      j.callExpression(j.identifier("Component"), [j.objectExpression([])]),
    );

  return assignment;
};

const findUseTarget = (ast, target) => {
  const decorator = getDecorator(ast);
  const objTarget = decorator.length
    ? decorator.find(j.ObjectExpression)
    : ast.find(j.ExportDefaultDeclaration).find(j.ObjectExpression);

  const finding = objTarget.find(j.Property, path => path.key.name === target);
  if (finding.length) return finding;

  const newProperty = j.property(
    "init",
    j.identifier(target),
    j.objectExpression([]),
  );

  objTarget.get("properties").value.unshift(newProperty);

  return objTarget;
};

const useImported = (useTarget, imported = []) => {
  imported
    .filter(
      name => !useTarget.find(j.Property, p => p.key.name === name).length,
    )
    .map(name => {
      useTarget
        .find(j.ObjectExpression)
        .at(0)
        .get()
        .value.properties.push(
          j.property("init", j.identifier(name), j.identifier(name)),
        );
    });
};

module.exports = (code, components = [], directives = []) => {
  const ast = j(code);

  const importTarget = findImportTarget(ast);
  injectImports(importTarget, [...components, ...directives]);

  if (components.length) {
    const useComponentsTarget = findUseTarget(ast, "components");
    useImported(useComponentsTarget, components);
  }
  if (directives.length) {
    const useDirectivesTarget = findUseTarget(ast, "directives");
    useImported(useDirectivesTarget, directives);
  }

  return ast.toSource();
};
