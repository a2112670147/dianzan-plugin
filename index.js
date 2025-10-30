import fs from 'node:fs'

/**
 * 遍历 apps 目录，加载所有 .js 文件作为插件应用
 */
const files = fs
  .readdirSync('./plugins/dianzan-plugin/apps')
  .filter((file) => file.endsWith('.js'))

let apps = {}
for (let file of files) {
  let name = file.replace('.js', '')
  // 使用动态导入加载插件模块
  apps[name] = (await import(`./apps/${file}`))[name]
}

// 导出 apps 对象，供 Yunzai 框架加载
export { apps }

logger.info('--------------------------')
logger.info('点赞续火插件初始化成功')
logger.info('--------------------------')