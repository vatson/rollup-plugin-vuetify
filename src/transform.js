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

const findDecorator = ast => {
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

  if (assignment.length === 0) {
    return assignment;
  }

  const call = assignment.find(j.CallExpression, {
    callee: {
      type: "Identifier",
      name: "Component",
    },
  });

  if (call.length !== 0) {
    return call;
  } 

  assignment
    .find(j.Identifier, { name: "Component" })
    .replaceWith(_ =>
      j.callExpression(j.identifier("Component"), [j.objectExpression([])]),
    );

  return assignment;
};

const findNormalizedComponentExpression = ast => ast.find(j.CallExpression, { callee: { name: '__vue_normalize__'}});

const findExport = ast => {
  const exportDeclaration = ast.find(j.ExportDefaultDeclaration);
  const exportAsObject = exportDeclaration.find(j.ObjectExpression);

  if (exportAsObject.length !== 0) {
    return exportAsObject;
  }

  // Export by reference
  const variableName = exportDeclaration.at(0).get().value.declaration.name;
  const variableDeclaration = ast.find(j.VariableDeclarator, { id: { name: variableName } });
  const normalizedComponentExpression = findNormalizedComponentExpression(variableDeclaration);

  if(normalizedComponentExpression.length !== 0) {
    return normalizedComponentExpression.find(j.ObjectExpression).at(1);
  };

  return variableDeclaration.find(j.ObjectExpression);
}

const findUseTarget = (ast, target) => {
  const decorator = findDecorator(ast);
  const objTarget = decorator.length !== 0
    ? decorator.find(j.ObjectExpression)
    : findExport(ast)
  ;

  const finding = objTarget.find(j.Property, path => path.key.name === target);
  if (finding.length !== 0) {
    return finding;
  } 

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

  if (components.length !== 0) {
    const useComponentsTarget = findUseTarget(ast, "components");
    useImported(useComponentsTarget, components);
  }
  if (directives.length !== 0) {
    const useDirectivesTarget = findUseTarget(ast, "directives");
    useImported(useDirectivesTarget, directives);
  }

  return ast.toSource();
};
