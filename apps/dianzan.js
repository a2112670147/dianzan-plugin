import plugin from "../../../lib/plugins/plugin.js"
import schedule from 'node-schedule'
import Setting from "../model/setting.js"

// 用于存储用户的点赞冷却数据：{ user_id: count }
let user_cd = {} 
const setting = new Setting()

/**
 * 点赞续火功能实现类
 * 包含手动命令、自动定时任务、冷却管理等功能
 */
export class dianzan extends plugin {
  constructor() {
    super({
      name: "点赞续火",
      dsc: "给好友点赞及续火功能",
      event: "message",
      priority: 5000,
      rule: [
        {
          reg: "^#*(贴贴|要贴贴)$",
          fnc: "thumbsUpMe",
        },
        {
          reg: "^#*(续火|小纸条|暖心话)$",
          fnc: "hitokoto",
        }
      ],
    })
    
    // 注意：已移除 this.initSchedule()，防止定时任务重复注册
  }
  
  /**
   * 手动触发点赞命令
   * 包含冷却检查和点赞执行逻辑
   */
  async thumbsUpMe() {
    const config = setting.getConfig()
    const userId = this.e.user_id
    
    // 初始化或获取冷却次数
    user_cd[userId] = user_cd[userId] ?? 0
    
    // 检查是否达到次数限制
    if (user_cd[userId] >= config.cooldown.count) {
      // 仅在首次超出时发送提示（user_cd[userId] == config.cooldown.count）
      if (user_cd[userId] == config.cooldown.count) {
        await this.reply(config.cooldown.tips)
      }
      user_cd[userId] += 1
      return true
    }
    
    // 未达限制，执行点赞并增加冷却计数
    user_cd[userId] += 1
    
    // 执行点赞操作 (Bot.pickFriend 依赖 Yunzai 框架)
    Bot.pickFriend(userId).thumbUp(config.thumbsUpMe.sum)
    await this.reply(config.thumbsUpMe.msg)
    return true
  }

  /** * 手动触发续火命令 (获取一言)
   */
  async hitokoto() {
    const config = setting.getConfig()
    try {
      let res = await fetch(config.hitokoto.api)
      let msg = await res.text()
      await this.reply(msg)
    } catch (e) {
      // 请求失败时发送默认文案
      await this.reply(config.hitokoto.default_text)
    }
    return true
  }

  /** * 定时任务：重置冷却数据
   */
  resetCD() {
    user_cd = {}
    logger.mark('[点赞续火] 冷却数据已重置')
  }

  /** * 定时任务：自动点赞配置列表中的好友
   */
  async autoThumbsUp() {
    const config = setting.getConfig()
    logger.mark(`[点赞续火][自动点赞] 触发定时`)
    
    for (let qq of Object.keys(config.thumbsUpMelist)) {
      // 执行点赞
      Bot.pickFriend(qq).thumbUp(config.thumbsUpMe.sum)
      logger.mark(`[点赞续火][自动点赞] 已给QQ${qq}点赞${config.thumbsUpMe.sum}次`)
      
      // 如果配置开启，则发送点赞消息
      if (config.thumbsUpMelist[qq].push) {
        Bot.pickFriend(qq).sendMsg(config.thumbsUpMe.msg)
      }
      
      // 增加延迟，避免触发风控 (10秒)
      await this.sleep(10000) 
    }
  }

  /** * 定时任务：自动发送一言续火给配置列表中的好友
   */
  async autoHitokoto() {
    const config = setting.getConfig()
    logger.mark(`[点赞续火][自动续火] 触发定时`)
    let msg = await this.getHitokotoText() // 先获取一言内容
    
    for (let qq of Object.keys(config.thumbsUpMelist)) {
      // 如果配置开启发送一言，则发送
      if (config.thumbsUpMelist[qq].hitokoto) {
        Bot.pickFriend(qq).sendMsg(msg)
      }
      // 增加延迟，避免触发风控 (2秒)
      await this.sleep(2000) 
    }
  }

  /** * 辅助函数：请求获取一言文本
   * @returns {string} 获取到的一言或默认文本
   */
  async getHitokotoText() {
    const config = setting.getConfig()
    try {
      let res = await fetch(config.hitokoto.api)
      return await res.text()
    } catch (e) {
      logger.warn(`[点赞续火][续火] 接口请求失败，使用默认文案`)
      return config.hitokoto.default_text
    }
  }

  /** * 辅助函数：休眠/等待
   * @param {number} time - 休眠时间（毫秒）
   */
  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time))
  }
}


// ------------------------------------------------------------------
// 插件启动时：初始化定时任务 (防止重复注册)
// ------------------------------------------------------------------

/**
 * 初始化所有定时任务。
 * 确保此函数只在插件主文件加载时执行一次。
 */
function initSchedule() {
  const config = setting.getConfig()
  
  // 实例化一个 dianzan 对象，用于调用非静态的 resetCD/autoThumbsUp/autoHitokoto 方法
  // 这种做法是为了避免在定时任务回调中获取不到 this.e 等上下文，但仍能调用到核心逻辑
  const dianzanInstance = new dianzan()

  // 1. 重置冷却定时任务 (每天 00:00:00)
  schedule.scheduleJob(config.schedule.resetCD, () => {
    dianzanInstance.resetCD()
  })

  // 2. 自动点赞定时任务 (每天 12:05:30)
  schedule.scheduleJob(config.schedule.thumbsUp, () => {
    dianzanInstance.autoThumbsUp()
  })

  // 3. 自动续火定时任务 (每天 12:15:30)
  schedule.scheduleJob(config.schedule.hitokoto, () => {
    dianzanInstance.autoHitokoto()
  })
  
  logger.mark('[点赞续火] 定时任务已成功注册')
}

// 确保在文件加载时执行一次
initSchedule()