const { parseComponent } = require("vue-template-compiler");
const fs = require("fs");
const path = require("path");

const readFile = path =>
  new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

const load = async id => {
  const filename = id.replace(/\?.*/, "");
  const content = (await readFile(filename)).toString("utf8");

  const component = parseComponent(content);

  let template, isExternalScript, scriptPath;

  if (component.template) {
    if (component.template.src) {
      template = (
        await readFile(
          path.resolve(path.dirname(filename), component.template.src),
        )
      ).toString("utf8");
    } else {
      template = component.template.content;
    }

    if (component.script.src) {
      scriptPath = path.resolve(path.dirname(filename), component.script.src);
      isExternalScript = true;
    }
  }

  return { template, scriptPath, isExternalScript };
};

module.exports = load;
