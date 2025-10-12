import fs from 'fs'
import yaml from 'yaml'

export default class Setting {
  constructor() {
    this.configPath = './plugins/dianzan-plugin/config/default_config/dianzan.yaml'
  }

  /** 获取配置 */
  getConfig() {
    try {
      const file = fs.readFileSync(this.configPath, 'utf8')
      return yaml.parse(file)
    } catch (error) {
      logger.error('读取配置失败:', error)
      return {}
    }
  }

  /** 保存配置 */
  saveConfig(config) {
    try {
      const yamlStr = yaml.stringify(config)
      fs.writeFileSync(this.configPath, yamlStr, 'utf8')
      return true
    } catch (error) {
      logger.error('保存配置失败:', error)
      return false
    }
  }
}