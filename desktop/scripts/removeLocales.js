// removeLocales.js
/**
 * 移除部分用不到的语言、优化electron包的大小
 */

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
exports.default = async function (context) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs')
  const localeDir = context.appOutDir + '/locales/'

  fs.readdir(localeDir, function (err, files) {
    //files is array of filenames (basename form)
    if (!(files && files.length)) return
    for (let i = 0, len = files.length; i < len; i++) {
      // zh 和 en 开头的都不删
      if (!files[i].startsWith('zh-CN')) {
        fs.unlinkSync(localeDir + files[i])
      }
    }
  })
}
