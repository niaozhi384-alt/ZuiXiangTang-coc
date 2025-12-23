import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, Trophy, TrendingUp, Gift, Crown, Calendar } from "lucide-react";

export default function Rewards() {
  const { data: rewards } = trpc.reward.list.useQuery();
  const { data: stats } = trpc.reward.stats.useQuery();

  const getRewardTypeName = (type: string) => {
    switch (type) {
      case "competition_first":
        return "竞赛第一";
      case "league_first":
        return "联赛第一";
      default:
        return "其他奖励";
    }
  };

  const getRewardTypeIcon = (type: string) => {
    switch (type) {
      case "competition_first":
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case "league_first":
        return <Crown className="w-4 h-4 text-primary" />;
      default:
        return <Gift className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Gift className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold gradient-text">醉乡堂</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-12 hero-pattern">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-6">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm">奖励荣誉榜</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">奖励发放记录</h1>
          <p className="text-muted-foreground">记录每一份荣誉，见证每一次成长</p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-8">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card className="gaming-card">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                  <Gift className="w-6 h-6 text-black" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">累计发放</p>
                  <p className="text-2xl font-bold gradient-text">¥{stats?.totalAmount.toFixed(2) ?? "0.00"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">发放次数</p>
                  <p className="text-2xl font-bold">{stats?.totalCount ?? 0} 次</p>
                </div>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">奖励类型</p>
                  <p className="text-2xl font-bold">{stats?.typeCount ?? 0} 种</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Reward Type Distribution */}
      {stats && stats.byType.length > 0 && (
        <section className="py-8">
          <div className="container">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">奖励类型分布</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
              {stats.byType.map((item) => (
                <Card key={item.type} className="gaming-card">
                  <CardContent className="p-4 flex items-center gap-3">
                    {getRewardTypeIcon(item.type)}
                    <div>
                      <p className="text-sm text-muted-foreground">{getRewardTypeName(item.type)}</p>
                      <p className="font-semibold">{item.count}次 / ¥{item.amount.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reward List */}
      <section className="py-8">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">发放记录</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {rewards && rewards.length > 0 ? (
              rewards.map((reward) => (
                <Card key={reward.id} className="gaming-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                          {getRewardTypeIcon(reward.rewardType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{reward.playerName}</span>
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                              {getRewardTypeName(reward.rewardType)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{reward.rewardName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold gradient-text">¥{parseFloat(reward.amount).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <Calendar className="w-3 h-3" />
                          {new Date(reward.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="gaming-card">
                <CardContent className="p-8 text-center text-muted-foreground">
                  暂无奖励发放记录
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Reward Rules */}
      <section className="py-12 bg-card/50">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">奖励规则</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card className="gaming-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <h3 className="font-semibold">部落竞赛第一</h3>
                </div>
                <p className="text-3xl font-bold gradient-text mb-2">¥5.00</p>
                <p className="text-sm text-muted-foreground">
                  每次部落竞赛结束后，积分排名第一的成员可获得现金奖励
                </p>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold">联赛第一</h3>
                </div>
                <p className="text-3xl font-bold gradient-text mb-2">令牌月卡</p>
                <p className="text-sm text-muted-foreground">
                  联赛系统排名第一的成员可获得令牌月卡奖励（有且仅有一个名额）
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container text-center text-sm text-muted-foreground">
          © 2025 醉乡堂. 欢迎所有COC爱好者加入我们的大家庭！
        </div>
      </footer>
    </div>
  );
}
