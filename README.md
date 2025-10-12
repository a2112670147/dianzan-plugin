# 点赞续火插件

一个用于自动点赞和发送一言续火的 Yunzai 插件。
![License](https://img.shields.io/github/license/a2112670147/dianzan-plugin)
![Last Commit](https://img.shields.io/github/last-commit/a2112670147/dianzan-plugin)
![Stars](https://img.shields.io/github/stars/a2112670147/dianzan-plugin?style=social)

> **声明**：这是我第一次开发 Yunzai 插件，部分功能逻辑参考了 [xiaotian2333/yunzai-plugins-Single-file](https://github.com/xiaotian2333/yunzai-plugins-Single-file/blob/main/%E7%82%B9%E8%B5%9E%E7%BB%AD%E7%81%AB.js) 项目，感谢原作者的分享。在 AI 的帮助下完成了代码重构和模块化。

## 功能
- 🎯 手动触发点赞和一言
- ⏰ 自动定时点赞和续火
- ❄️ 冷却时间限制
- ⚙️ 完全可配置

## 安装


# 克隆插件
```git clone https://github.com/a2112670147/dianzan-plugin.git ./plugins/dianzan-plugin```

# 进入插件目录安装依赖
```
cd plugins/dianzan-plugin
pnpm install
```
# 重启 Yunzai
安装完成后重启 Yunzai

## 🎮 使用说明

### 手动触发指令
| 指令 | 功能 | 示例 |
|------|------|------|
| \`#贴贴\` | 请求给好友点赞 | \`#贴贴\` |
| \`#要贴贴\` | 同上 | \`#要贴贴\` |
| \`#续火\` | 获取随机一言 | \`#续火\` |
| \`#小纸条\` | 获取随机一言 | \`#小纸条\` |
| \`#暖心话\` | 获取随机一言 | \`#暖心话\` |

### 自动功能
- **自动点赞**：每天 12:05:30 自动给配置列表中的好友点赞
- **自动续火**：每天 12:15:30 自动给配置列表中的好友发送一言
- **冷却重置**：每天 00:00:00 重置点赞冷却次数

## ⚙️ 配置说明

编辑 \`config/default_config/dianzan.yaml\` 文件：

# 自动点赞续火列表（在此添加好友QQ）
thumbsUpMelist:
  123456789:    # 好友QQ号
    push: true       # 点赞后是否发送消息
    hitokoto: true   # 是否发送一言

# 点赞配置
thumbsUpMe:
  sum: 10           # 每次点赞次数
  msg: \"芙芙给你点赞啦，记得给我回赞哦\"  # 点赞消息

# 一言配置
hitokoto:
  api: \"https://v1.hitokoto.cn/?encode=text&charset=utf-8&c=d&c=i&c=h&c=e\"
  default_text: \"种自己的花，爱自己的宇宙🌍\"

# 冷却配置
cooldown:
  count: 1          # 每天可触发次数
  tips: \"哼哼哼，今天已经点过赞啦，还想骗芙芙的赞，你这个坏人\"

# 定时任务配置（cron表达式）
schedule:
  thumbsUp: \"30 5 12 * * *\"    # 自动点赞时间
  hitokoto: \"30 15 12 * * *\"   # 自动续火时间
  resetCD: \"0 0 0 * * *\"       # 冷却重置时间
\`\`\`

## 🙏 致谢
- 感谢 [xiaotian2333](https://github.com/xiaotian2333) 的原版点赞续火脚本
- 感谢 Yunzai-Bot 社区
- 感谢所有测试和使用本插件的用户
"@ | Out-File -FilePath README.md -Encoding UTF8
