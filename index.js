import fs from 'node:fs'

const files = fs
  .readdirSync('./plugins/dianzan-plugin/apps')
  .filter((file) => file.endsWith('.js'))

let apps = {}
for (let file of files) {
  let name = file.replace('.js', '')
  apps[name] = (await import(`./apps/${file}`))[name]
}

export { apps }

logger.info('--------------------------')
logger.info('点赞续火插件初始化成功')
logger.info('--------------------------')