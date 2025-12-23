import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, Users, RefreshCw, Search, BarChart3 } from "lucide-react";
import { useState } from "react";

export default function Registrations() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: registrations, refetch, isLoading } = trpc.registration.list.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    level: levelFilter === "all" ? undefined : parseInt(levelFilter),
    search: search || undefined,
  });

  const { data: stats } = trpc.registration.stats.useQuery();
  const { data: distribution } = trpc.registration.townHallDistribution.useQuery();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="status-pending px-2 py-1 rounded-full text-xs">待审核</span>;
      case "approved":
        return <span className="status-approved px-2 py-1 rounded-full text-xs">已通过</span>;
      case "rejected":
        return <span className="status-rejected px-2 py-1 rounded-full text-xs">已拒绝</span>;
      default:
        return null;
    }
  };

  const townHallLevels = Array.from({ length: 17 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-4">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm">共 {stats?.total ?? 0} 人报名</span>
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">报名列表</h1>
            <p className="text-muted-foreground">查看所有报名信息</p>
          </div>

          {/* Filters */}
          <Card className="gaming-card mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Search className="w-4 h-4" />
                  筛选条件
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="搜索昵称或ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[150px] bg-background border-border">
                    <SelectValue placeholder="全部状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="pending">待审核</SelectItem>
                    <SelectItem value="approved">已通过</SelectItem>
                    <SelectItem value="rejected">已拒绝</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-full md:w-[150px] bg-background border-border">
                    <SelectValue placeholder="全部等级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部等级</SelectItem>
                    {townHallLevels.map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        {level} 本
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Registration Table */}
          <Card className="gaming-card mb-6">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-muted-foreground font-medium">游戏昵称</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">游戏ID</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">
                        <span className="flex items-center gap-1">
                          🏰 大本营
                        </span>
                      </th>
                      <th className="text-left p-4 text-muted-foreground font-medium">备注</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">状态</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">报名时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          加载中...
                        </td>
                      </tr>
                    ) : registrations && registrations.length > 0 ? (
                      registrations.map((reg) => (
                        <tr key={reg.id} className="border-b border-border hover:bg-card/50 transition-colors">
                          <td className="p-4 font-medium">{reg.gameName}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 rounded bg-muted text-sm">{reg.townHallLevel} 本</span>
                          </td>
                          <td className="p-4">{reg.townHallLevel} 本</td>
                          <td className="p-4 text-muted-foreground">{reg.remarks || "-"}</td>
                          <td className="p-4">{getStatusBadge(reg.status)}</td>
                          <td className="p-4 text-muted-foreground text-sm">
                            {new Date(reg.createdAt).toLocaleDateString('zh-CN')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          暂无报名记录
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Town Hall Distribution */}
          {distribution && distribution.length > 0 && (
            <Card className="gaming-card max-w-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  大本营等级分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {distribution.map((item) => (
                    <div key={item.level} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-12">{item.level} 本</span>
                      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full gradient-bg rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((item.count / (stats?.total || 1)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
