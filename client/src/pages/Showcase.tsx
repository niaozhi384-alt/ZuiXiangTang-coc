import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  Home, Users, Trophy, Shield, Settings, 
  CheckCircle, Clock, XCircle, Gift, 
  Smartphone, Monitor, Copy, Search,
  ArrowRight, Star, Zap, Lock
} from "lucide-react";
import { useState } from "react";

export default function Showcase() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Home,
      title: "首页展示",
      description: "游戏化风格的首页设计，包含部落信息、报名状态、公告区域和统计数据",
      color: "from-orange-500 to-amber-500",
      details: [
        "Hero区域展示部落名称和口号",
        "实时报名状态显示（进行中/已关闭）",
        "部落公告和联赛规则说明",
        "奖励机制介绍（竞赛第一五元、联赛第一金月卡）",
        "QQ群联系方式一键复制",
        "报名统计实时数据展示"
      ]
    },
    {
      icon: Users,
      title: "报名系统",
      description: "游客无需登录即可报名，支持游戏昵称、大本营等级和备注信息",
      color: "from-blue-500 to-cyan-500",
      details: [
        "游戏昵称输入",
        "大本营等级选择（1-17本）",
        "备注信息填写",
        "报名截止时间显示",
        "表单验证和提交反馈"
      ]
    },
    {
      icon: Search,
      title: "报名列表",
      description: "展示所有报名信息，支持多维度筛选和搜索功能",
      color: "from-green-500 to-emerald-500",
      details: [
        "按状态筛选（全部/待审核/已通过/已拒绝）",
        "按大本营等级筛选",
        "搜索昵称或ID",
        "大本营等级分布图表",
        "报名时间显示"
      ]
    },
    {
      icon: Trophy,
      title: "奖励记录",
      description: "记录每一份荣誉，展示累计发放金额、次数和详细记录",
      color: "from-yellow-500 to-orange-500",
      details: [
        "累计发放金额统计",
        "发放次数统计",
        "奖励类型分布",
        "详细发放记录列表",
        "奖励规则说明"
      ]
    },
    {
      icon: Lock,
      title: "管理员登录",
      description: "独立的管理员账号密码登录系统，与普通用户完全分离",
      color: "from-purple-500 to-pink-500",
      details: [
        "邮箱账号登录",
        "密码安全加密存储",
        "登录状态持久化",
        "安全退出功能",
        "游客无需登录即可使用基础功能"
      ]
    },
    {
      icon: Settings,
      title: "管理后台",
      description: "管理员专属后台，可审核报名、控制开关、管理奖励",
      color: "from-red-500 to-rose-500",
      details: [
        "报名审核（通过/拒绝）",
        "报名开关控制",
        "添加奖励发放记录",
        "删除报名数据",
        "实时统计数据"
      ]
    }
  ];

  const techStack = [
    { name: "React 19", desc: "前端框架" },
    { name: "TypeScript", desc: "类型安全" },
    { name: "Tailwind CSS 4", desc: "样式框架" },
    { name: "tRPC", desc: "类型安全API" },
    { name: "Drizzle ORM", desc: "数据库ORM" },
    { name: "Express", desc: "后端服务器" },
  ];

  const stats = [
    { label: "页面数量", value: "7+", icon: Monitor },
    { label: "API接口", value: "15+", icon: Zap },
    { label: "功能模块", value: "6", icon: Star },
    { label: "响应式设计", value: "✓", icon: Smartphone },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">醉乡堂项目展示</span>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
              <Home className="w-4 h-4 mr-2" />
              访问网站
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 mb-6">
            <Star className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-sm">部落冲突联赛报名管理系统</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              醉乡堂
            </span>
            <br />
            <span className="text-3xl md:text-4xl text-gray-300">网站复制项目</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            基于 zuixiangtang.space 的完整复制，采用现代化技术栈重构，
            实现游戏化风格的报名、审核、奖励记录等功能
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                <Home className="w-5 h-5 mr-2" />
                访问首页
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button size="lg" variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                <Lock className="w-5 h-5 mr-2" />
                管理员登录
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-y border-gray-800 bg-gray-900/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-orange-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">功能特性</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              完整复制原网站的所有核心功能，并进行了现代化重构和优化
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Feature Cards */}
            <div className="lg:col-span-1 space-y-4">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeFeature === index 
                      ? 'bg-gray-800 border-orange-500/50 shadow-lg shadow-orange-500/10' 
                      : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{feature.title}</h3>
                      <p className="text-sm text-gray-400 line-clamp-1">{feature.description}</p>
                    </div>
                    <ArrowRight className={`w-5 h-5 ml-auto transition-transform ${
                      activeFeature === index ? 'text-orange-400 translate-x-1' : 'text-gray-600'
                    }`} />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Feature Detail */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-900/50 border-gray-800 h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${features[activeFeature].color} flex items-center justify-center`}>
                      {(() => {
                        const Icon = features[activeFeature].icon;
                        return <Icon className="w-8 h-8 text-white" />;
                      })()}
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-white">{features[activeFeature].title}</CardTitle>
                      <p className="text-gray-400 mt-1">{features[activeFeature].description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">功能详情</h4>
                  <ul className="space-y-3">
                    {features[activeFeature].details.map((detail, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </div>
                        <span className="text-gray-300">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 px-4 bg-gray-900/50 border-y border-gray-800">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">技术栈</h2>
            <p className="text-gray-400">采用现代化技术栈构建，确保性能和可维护性</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((tech, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 hover:border-orange-500/50 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="text-lg font-semibold text-white mb-1">{tech.name}</div>
                  <div className="text-sm text-gray-400">{tech.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Info Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/30">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">管理员登录信息</h3>
                  <p className="text-gray-400 mb-4">
                    使用以下凭证登录管理后台，体验完整的管理功能
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 text-sm">
                    <div className="bg-gray-900/50 rounded-lg px-4 py-2 border border-gray-700">
                      <span className="text-gray-400">账号：</span>
                      <span className="text-orange-400 font-mono">niaozhi384@gmail.com</span>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg px-4 py-2 border border-gray-700">
                      <span className="text-gray-400">密码：</span>
                      <span className="text-orange-400 font-mono">Qwe132137489910@</span>
                    </div>
                  </div>
                </div>
                <Link href="/admin/login">
                  <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                    <Lock className="w-5 h-5 mr-2" />
                    立即登录
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 px-4 bg-gray-900/50 border-t border-gray-800">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">快速访问</h2>
            <p className="text-gray-400">点击下方卡片快速访问各个功能页面</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: "/", icon: Home, label: "首页", color: "from-orange-500 to-amber-500" },
              { href: "/register", icon: Users, label: "报名", color: "from-blue-500 to-cyan-500" },
              { href: "/registrations", icon: Search, label: "报名列表", color: "from-green-500 to-emerald-500" },
              { href: "/rewards", icon: Trophy, label: "奖励记录", color: "from-yellow-500 to-orange-500" },
            ].map((link, index) => (
              <Link key={index} href={link.href}>
                <Card className="bg-gray-800/50 border-gray-700 hover:border-orange-500/50 transition-all hover:scale-105 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mx-auto mb-3`}>
                      <link.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-lg font-semibold text-white">{link.label}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="container mx-auto text-center text-gray-500">
          <p>© 2025 醉乡堂网站复制项目 | 基于 zuixiangtang.space</p>
          <p className="text-sm mt-2">
            此展示页面让您可以<strong>更直观地探索数据</strong>、<strong>更好地理解趋势</strong>，以及<strong>方便保存或分享</strong>
          </p>
        </div>
      </footer>
    </div>
  );
}
