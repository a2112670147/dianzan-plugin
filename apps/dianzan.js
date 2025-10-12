import plugin from "../../../lib/plugins/plugin.js"
import schedule from 'node-schedule'
import Setting from "../model/setting.js"

let user_cd = {} // 冷却数据
const setting = new Setting()

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

    this.initSchedule()
  }

  /** 初始化定时任务 */
  initSchedule() {
    const config = setting.getConfig()
    
    // 重置冷却定时任务
    schedule.scheduleJob(config.schedule.resetCD, () => {
      this.resetCD()
    })

    // 自动点赞定时任务
    schedule.scheduleJob(config.schedule.thumbsUp, () => {
      this.autoThumbsUp()
    })

    // 自动续火定时任务  
    schedule.scheduleJob(config.schedule.hitokoto, () => {
      this.autoHitokoto()
    })
  }

  /** 贴贴命令 */
  async thumbsUpMe() {
    const config = setting.getConfig()
    
    // 冷却检查逻辑
    user_cd[this.e.user_id] = user_cd[this.e.user_id] ?? 0
    
    if (user_cd[this.e.user_id] >= config.cooldown.count) {
      if (user_cd[this.e.user_id] == config.cooldown.count) {
        await this.reply(config.cooldown.tips)
      }
      user_cd[this.e.user_id] += 1
      return true
    }
    
    // 加入冷却
    user_cd[this.e.user_id] += 1
    
    // 执行点赞
    Bot.pickFriend(this.e.user_id).thumbUp(config.thumbsUpMe.sum)
    await this.reply(config.thumbsUpMe.msg)
    return true
  }

  /** 续火命令 */
  async hitokoto() {
    try {
      const config = setting.getConfig()
      let res = await fetch(config.hitokoto.api)
      let msg = await res.text()
      await this.reply(msg)
    } catch (e) {
      const config = setting.getConfig()
      await this.reply(config.hitokoto.default_text)
    }
    return true
  }

  /** 重置冷却 */
  resetCD() {
    user_cd = {}
    logger.mark('[点赞续火] 冷却数据已重置')
  }

  /** 自动点赞 */
  async autoThumbsUp() {
    const config = setting.getConfig()
    for (let qq of Object.keys(config.thumbsUpMelist)) {
      Bot.pickFriend(qq).thumbUp(config.thumbsUpMe.sum)
      logger.mark(`[点赞续火][自动点赞] 已给QQ${qq}点赞${config.thumbsUpMe.sum}次`)
      if (config.thumbsUpMelist[qq].push) {
        Bot.pickFriend(qq).sendMsg(config.thumbsUpMe.msg)
      }
      await this.sleep(10000) // 等10秒再下一个
    }
  }

  /** 自动续火 */
  async autoHitokoto() {
    const config = setting.getConfig()
    logger.mark(`[点赞续火][自动续火] 触发一言定时`)
    let msg = await this.getHitokotoText()
    
    for (let qq of Object.keys(config.thumbsUpMelist)) {
      if (config.thumbsUpMelist[qq].hitokoto) {
        Bot.pickFriend(qq).sendMsg(msg)
      }
      await this.sleep(2000) // 等2秒再下一个
    }
  }

  /** 获取一言文本 */
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

  /** 休眠函数 */
  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time))
  }
}