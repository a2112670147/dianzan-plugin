import fs from 'fs'
import path from 'path'
import yaml from 'yaml'

// 获取插件的根目录路径，用于构建绝对路径，避免工作目录变化导致路径错误
const pluginRoot = path.join(path.resolve(), 'plugins', 'dianzan-plugin')

/**
 * 插件配置管理类
 * 负责读取、保存和初始化配置（区分默认配置与用户配置）
 */
export default class Setting {
  constructor() {
    // 用户可编辑的配置路径，优先读取，不会被 Git 更新覆盖
    this.userConfigPath = path.join(pluginRoot, 'config', 'dianzan.yaml')
    // 插件自带的默认配置路径，作为备份
    this.defaultConfigPath = path.join(pluginRoot, 'config', 'default_config', 'dianzan.yaml')
  }

  /**
   * 获取插件配置
   * @returns {object} 配置对象
   */
  getConfig() {
    // 1. 尝试读取用户配置
    if (fs.existsSync(this.userConfigPath)) {
      try {
        const file = fs.readFileSync(this.userConfigPath, 'utf8')
        return yaml.parse(file)
      } catch (error) {
        // 如果用户配置存在但解析失败，记录错误并继续尝试读取默认配置
        logger.error('[点赞续火] 读取用户配置失败，请检查语法:', error)
      }
    }

    // 2. 如果用户配置不存在或读取失败，则读取默认配置
    try {
      const file = fs.readFileSync(this.defaultConfigPath, 'utf8')
      const config = yaml.parse(file)
      
      // 3. 如果用户配置不存在，则自动复制一份默认配置到 config/dianzan.yaml
      if (!fs.existsSync(this.userConfigPath)) {
        logger.mark('[点赞续火] 用户配置不存在，已自动创建 config/dianzan.yaml')
        // 确保 config 目录存在
        const configDir = path.dirname(this.userConfigPath)
        if (!fs.existsSync(configDir)) {
             fs.mkdirSync(configDir, { recursive: true })
        }
        // 复制默认配置内容到用户配置路径
        fs.writeFileSync(this.userConfigPath, file, 'utf8')
      }
      
      return config
    } catch (error) {
      logger.error('[点赞续火] 读取默认配置失败:', error)
      return {}
    }
  }

  /**
   * 保存配置（通常用于运行时修改）
   * @param {object} config - 要保存的配置对象
   * @returns {boolean} 是否成功
   */
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