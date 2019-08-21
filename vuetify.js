const {  } = require('vuetify-loader/lib/matcher')

function install (install, content, imports) {
  if (imports.length) {
    let newContent = '/* vuetify-loader */\n'
    newContent += `import ${install} from ${loaderUtils.stringifyRequest(this, '!' + runtimePaths[install])}\n`
    newContent += imports.map(i => i[1]).join('\n') + '\n'
    newContent += `${install}(component, {${imports.map(i => i[0]).join(',')}})\n`

    // Insert our modification before the HMR code
    const hotReload = content.indexOf('/* hot reload */')
    if (hotReload > -1) {
      content = content.slice(0, hotReload) + newContent + '\n\n' + content.slice(hotReload)
    } else {
      content += '\n\n' + newContent
    }
  }

  return content
}