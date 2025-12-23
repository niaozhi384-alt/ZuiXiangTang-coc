import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { 
  Users, Clock, CheckCircle, XCircle, 
  Trophy, MessageCircle, Zap, TrendingUp,
  ArrowRight, Copy, Sparkles, Shield,
  Gift, Crown, Calendar
} from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const { data: stats } = trpc.registration.stats.useQuery();
  const { data: settings } = trpc.settings.getRegistrationStatus.useQuery();
  const { data: rewardStats } = trpc.reward.stats.useQuery();
  const { data: contentSettings } = trpc.settings.getContent.useQuery();


  const copyQQGroup = () => {
    navigator.clipboard.writeText("1036109738");
    toast.success("QQ群号已复制到剪贴板");
  };

  const isOpen = settings?.isOpen ?? false;
  const deadline = settings?.deadline ? new Date(settings.deadline) : null;
  const isDeadlinePassed = deadline ? deadline < new Date() : false;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold gradient-text">醉乡堂</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/registrations">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Users className="w-4 h-4 mr-2" />
                报名列表
              </Button>
            </Link>
            <Link href="/rewards">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Trophy className="w-4 h-4 mr-2" />
                奖励记录
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                登录
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 hero-pattern">
        <div className="container text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm">{isOpen && !isDeadlinePassed ? "报名进行中" : "报名已关闭"}</span>
            {deadline && !isDeadlinePassed && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                截止: {deadline.toLocaleDateString('zh-CN')}
              </span>
            )}
          </div>

          {/* Main Title */}
          <h1 className="text-6xl md:text-8xl font-bold gradient-text mb-6">
            醉乡堂
          </h1>
          
          <p className="text-2xl md:text-3xl text-muted-foreground mb-4">
            醉月频中圣，迷花不事君
          </p>
          
          <p className="text-lg text-muted-foreground mb-2 whitespace-pre-line">
            {contentSettings?.clanFeatures?.split('\n')[0] || "五湖四海皆兄弟，醉乡堂里认神州 🇨🇳"}
          </p>
          
          <p className="text-sm text-muted-foreground mb-6">
            {contentSettings?.clanFeatures?.split('\n').slice(1).join(' · ') || "Clash of Clans 专业部落联盟 · 兼顾竞技与休闲 · 欢迎COC爱好者加入"}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register">
              <Button size="lg" className="gradient-bg text-black font-semibold px-8">
                立即报名
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/registrations">
              <Button size="lg" variant="outline" className="px-8">
                查看报名列表
              </Button>
            </Link>
          </div>

          {/* Reward Stats Card */}
          {rewardStats && rewardStats.totalCount > 0 && (
            <Link href="/rewards">
              <Card className="inline-block gaming-card cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                    <Gift className="w-6 h-6 text-black" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">累计发放奖励</p>
                    <p className="text-2xl font-bold gradient-text">¥{rewardStats.totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">共 {rewardStats.totalCount} 次发放 · 点击查看详情</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </section>

      {/* Announcement Section */}
      <section className="py-16 bg-card/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold gradient-text mb-2">部落公告</h2>
            <p className="text-muted-foreground">最新活动信息与部落动态</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="gaming-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      联赛说明
                      <Shield className="w-4 h-4 text-primary" />
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                      {contentSettings?.announcement || "参赛不打⚔️。为保证联赛公平性,联赛需要打对位,也可以和别人商量着换位打,扰乱公平性者⚔️。联赛结束发放奖励😊"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Info Cards Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Reward Mechanism */}
            <Card className="gaming-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-black" />
                  </div>
                  <h3 className="font-semibold">奖励机制</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-muted-foreground text-sm whitespace-pre-line">
                    {contentSettings?.rewardMechanism || "竞赛第一五元、联赛第一金月卡"}
                  </p>
                </div>
                <Link href="/rewards" className="block mt-4">
                  <Button variant="ghost" size="sm" className="w-full text-primary hover:text-primary">
                    查看奖励发放记录 →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Contact Us */}
            <Card className="gaming-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="font-semibold">联系我们</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">QQ群</p>
                  <p className="text-2xl font-bold text-blue-400">1036109738</p>
                  <p className="text-sm text-muted-foreground">欢迎COC爱好者加入~</p>
                </div>
              </CardContent>
            </Card>

            {/* Clan Features */}
            <Card className="gaming-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="font-semibold">部落特色</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    专业竞技团队
                  </li>
                  <li className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-primary" />
                    完善奖励体系
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    友好社区氛围
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    持续成长发展
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold gradient-text mb-2">报名统计</h2>
            <p className="text-muted-foreground">实时报名数据一览</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="gaming-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl font-bold">{stats?.total ?? 0}</p>
                <p className="text-sm text-muted-foreground">总报名</p>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold">{stats?.pending ?? 0}</p>
                <p className="text-sm text-muted-foreground">待审核</p>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-3xl font-bold">{stats?.approved ?? 0}</p>
                <p className="text-sm text-muted-foreground">已通过</p>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-3xl font-bold">{stats?.rejected ?? 0}</p>
                <p className="text-sm text-muted-foreground">已拒绝</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold gradient-text mb-4">加入醉乡堂</h2>
            <p className="text-muted-foreground mb-8">
              我们欢迎所有热爱Clash of Clans的玩家加入我们的大家庭。无论你是新手还是老玩家，在这里都能找到属于自己的位置。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="gradient-bg text-black font-semibold px-8">
                  <Users className="w-4 h-4 mr-2" />
                  立即报名
                </Button>
              </Link>
              <Button size="lg" variant="outline" onClick={copyQQGroup}>
                <Copy className="w-4 h-4 mr-2" />
                复制QQ群号
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold gradient-text">醉乡堂</span>
              </div>
              <p className="text-sm text-muted-foreground">
                五湖四海皆兄弟，醉乡堂里认神州。专业的COC部落，期待你的加入！
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">快速链接</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/register" className="hover:text-primary transition-colors">联赛报名</Link></li>
                <li><Link href="/registrations" className="hover:text-primary transition-colors">报名列表</Link></li>
                <li><Link href="/rewards" className="hover:text-primary transition-colors">奖励记录</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">联系方式</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>QQ群：1036109738</li>
                <li>游戏：Clash of Clans</li>
                <li>部落名：醉乡堂</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 醉乡堂. 欢迎所有COC爱好者加入我们的大家庭！
          </div>
        </div>
      </footer>
    </div>
  );
}
