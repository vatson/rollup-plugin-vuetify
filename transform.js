const j = require("jscodeshift");
const recast = require("recast");

const builder = recast.types.builders;

const genImport = (name, path) => {
  return builder.importDeclaration(
    [builder.importSpecifier(builder.identifier(name))],
    builder.literal(path)
  );
};

const findImportTarget = ast => {
  let collection = ast.find(j.ImportDeclaration, path =>
    path.source.value.startsWith("vuetify/lib")
  );

  if (collection.length === 0) {
    collection = j.importDeclaration([], j.literal("vuetifty/lib"));
    ast.get().node.program.body.unshift(collection);

    return collection;
  }

  return collection.nodes()[0];
};

module.exports = (code, components = [], directives = []) => {
  const ast = j(code);

  const importTarget = findImportTarget(ast);

  // const imports = [];
  // for (const name in components) {
  //   imports.push(genImport(name, components[name]));
  // }
  // for (const name in directives) {
  //   imports.push(genImport(name, directives[name]));
  // }

  const alreadyAdded = importTarget.specifiers
    .filter(path => path.type === j.ImportSpecifier.name)
    .map(path => path.local.name);

  const uniqImportSpecifiers = [...components, ...directives]
    .filter(name => !alreadyAdded.includes(name))
    .map(name => j.importSpecifier(j.identifier(name)));

  importTarget.specifiers = [
    ...importTarget.specifiers,
    ...uniqImportSpecifiers
  ];

  console.log(code, components, ast.toSource());
};

// From ASTExplorer

// Press ctrl+space for code completion

// ### Source
// import Vuetify, { VAlert as Alert, VIcon } from 'vuetify/lib'
// import { resolve } from 'path'

// export default {
//     name: 'SimpleComponent',
//     props: {
//         icon: { type: String, "default": 'close' },
//     },
// };

// ### Transform
// export default function transformer(file, api) {
//   const j = api.jscodeshift;

//   const findImportTarget = ast => {
//     let collection = ast.find(j.ImportDeclaration, path => path.source.value.startsWith("vuetify/lib"));

//     if (collection.length === 0) {
//       collection = j.importDeclaration([], j.literal("vuetifty/lib"));
//       ast.get().node.program.body.unshift(collection);

//       return collection;
//     }

//     return collection.nodes()[0];
//   };

//   const ast = j(file.source);
//   const collection = findImportTarget(ast);

//   console.log(collection);

//   const alreadyAdded = collection.specifiers.filter(path => path.type === j.ImportSpecifier.name).map(path => path.local.name);

//   collection.specifiers.push(j.importSpecifier(j.identifier("VIcon")));

//   console.log(alreadyAdded);

//   return (
//     ast

//       //j(file.source)
//       //  .find(j.ImportDeclaration, path => path.source.value.startsWith("vuetify/lib"))

//       //.insertBefore(_ =>
//       //  j.importDeclaration(
//       //    [j.importSpecifier(j.identifier("sample"))],
//       //    j.literal("wtf")
//       //  )
//       //)

//       //    .forEach(path => {
//       //      j(path).replaceWith(
//       //        j.identifier(path.node.name.split('').reverse().join(''))
//       //      );
//       //    })
//       .toSource()
//   );
// }
