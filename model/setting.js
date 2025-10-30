import fs from 'fs'
import path from 'path'
import yaml from 'yaml'

// 获取当前模块的目录路径
// 注意：如果你的运行环境不支持 __dirname，可能需要使用 import.meta.url
const pluginRoot = path.join(path.resolve(), 'plugins', 'dianzan-plugin')

export default class Setting {
  constructor() {
    // 用户配置路径（优先读取，用户编辑）
    this.userConfigPath = path.join(pluginRoot, 'config', 'dianzan.yaml')
    // 默认配置路径（备份，更新时可能被覆盖）
    this.defaultConfigPath = path.join(pluginRoot, 'config', 'default_config', 'dianzan.yaml')
  }

  /** 获取配置 */
  getConfig() {
    // 1. 尝试读取用户配置
    if (fs.existsSync(this.userConfigPath)) {
      try {
        const file = fs.readFileSync(this.userConfigPath, 'utf8')
        return yaml.parse(file)
      } catch (error) {
        logger.error('[点赞续火] 读取用户配置失败:', error)
        // 容错：如果用户配置存在但读取/解析失败，则尝试读取默认配置
      }
    }

    // 2. 如果用户配置不存在或读取失败，则读取默认配置
    try {
      const file = fs.readFileSync(this.defaultConfigPath, 'utf8')
      const config = yaml.parse(file)
      
      // 3. 复制默认配置到用户配置路径（仅在用户配置不存在时执行）
      if (!fs.existsSync(this.userConfigPath)) {
        logger.mark('[点赞续火] 用户配置不存在，已自动创建 config/dianzan.yaml')
        // 确保 config 目录存在
        const configDir = path.dirname(this.userConfigPath)
        if (!fs.existsSync(configDir)) {
             fs.mkdirSync(configDir, { recursive: true })
        }
        fs.writeFileSync(this.userConfigPath, file, 'utf8')
      }
      
      return config
    } catch (error) {
      logger.error('[点赞续火] 读取默认配置失败:', error)
      return {}
    }
  }

  /** 保存配置 (如果需要实现运行时修改配置功能，此方法依然有用) */
  saveConfig(config) {
    try {
      const yamlStr = yaml.stringify(config)
      fs.writeFileSync(this.userConfigPath, yamlStr, 'utf8')
      return true
    } catch (error) {
      logger.error('[点赞续火] 保存配置失败:', error)
      return false
    }
  }
}