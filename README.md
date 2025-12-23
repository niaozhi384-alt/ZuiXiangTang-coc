# 醉乡堂 - 部落冲突联赛报名系统

一个游戏化风格的部落冲突联赛报名管理系统。

## 功能特性

* 首页展示：Hero区域、部落公告、奖励机制、报名统计
* 报名系统：游客无需登录即可报名
* 报名列表：支持按状态/等级筛选、搜索功能
* 奖励记录：累计发放金额、发放次数、奖励类型分布
* 管理员系统：独立账号密码登录
* 大本营等级范围设置：管理员可动态调整
* Excel导出：支持导出报名列表为CSV格式
* 防重复报名：同一游戏昵称只能报名一次

## 技术栈

* 前端：React 18 + TypeScript + Tailwind CSS
* 后端：Express + tRPC
* 数据库：PostgreSQL + Drizzle ORM

## 快速开始

1. npm install
2. 配置数据库连接字符串
3. npm run db:push
4. npm run dev

## 许可证

MIT License

