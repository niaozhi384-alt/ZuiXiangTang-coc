import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, Users, Trophy, Settings, LogOut, 
  CheckCircle, XCircle, Trash2, Plus, Loader2,
  Clock, Shield, Gift, RefreshCw, Download, FileText,
  Calendar, Edit
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  
  const { data: admin, isLoading: checkingAuth } = trpc.admin.me.useQuery();
  const { data: registrations, refetch: refetchRegistrations } = trpc.registration.list.useQuery({});
  const { data: stats } = trpc.registration.stats.useQuery();
  const { data: rewards, refetch: refetchRewards } = trpc.reward.list.useQuery();
  const { data: rewardStats } = trpc.reward.stats.useQuery();
  const { data: settings, refetch: refetchSettings } = trpc.settings.getRegistrationStatus.useQuery();
  const { data: contentSettings, refetch: refetchContent } = trpc.settings.getContent.useQuery();
  const { data: levelRange, refetch: refetchLevelRange } = trpc.settings.getTownHallLevelRange.useQuery();
  const { data: exportData } = trpc.registration.exportData.useQuery(undefined, {
    enabled: !!admin, // Only fetch when admin is logged in
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!checkingAuth && !admin) {
      setLocation("/admin/login");
    }
  }, [admin, checkingAuth, setLocation]);

  const logoutMutation = trpc.admin.logout.useMutation({
    onSuccess: () => {
      toast.success("已退出登录");
      setLocation("/admin/login");
    },
  });

  const updateStatusMutation = trpc.registration.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("状态更新成功");
      refetchRegistrations();
      utils.registration.stats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "操作失败");
    },
  });

  const deleteRegistrationMutation = trpc.registration.delete.useMutation({
    onSuccess: () => {
      toast.success("删除成功");
      refetchRegistrations();
      utils.registration.stats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "删除失败");
    },
  });

  const setRegistrationOpenMutation = trpc.settings.setRegistrationOpen.useMutation({
    onSuccess: () => {
      toast.success("设置已更新");
      refetchSettings();
    },
    onError: (error) => {
      toast.error(error.message || "设置失败");
    },
  });

  const setDeadlineMutation = trpc.settings.setDeadline.useMutation({
    onSuccess: () => {
      toast.success("截止时间已更新");
      refetchSettings();
    },
    onError: (error) => {
      toast.error(error.message || "设置失败");
    },
  });

  const updateContentMutation = trpc.settings.updateContent.useMutation({
    onSuccess: () => {
      toast.success("内容已更新");
      refetchContent();
      setShowEditContent(false);
    },
    onError: (error) => {
      toast.error(error.message || "更新失败");
    },
  });

  const createRewardMutation = trpc.reward.create.useMutation({
    onSuccess: () => {
      toast.success("奖励记录已添加");
      refetchRewards();
      utils.reward.stats.invalidate();
      setNewReward({ 
        playerName: "", 
        rewardType: "competition_first", 
        rewardName: "", 
        amount: "",
        rewardTime: new Date().toISOString().slice(0, 16)
      });
      setShowAddReward(false);
    },
    onError: (error) => {
      toast.error(error.message || "添加失败");
    },
  });

  const deleteRewardMutation = trpc.reward.delete.useMutation({
    onSuccess: () => {
      toast.success("删除成功");
      refetchRewards();
      utils.reward.stats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "删除失败");
    },
  });

  const setLevelRangeMutation = trpc.settings.setTownHallLevelRange.useMutation({
    onSuccess: () => {
      toast.success("大本营等级范围已更新");
      refetchLevelRange();
    },
    onError: (error) => {
      toast.error(error.message || "设置失败");
    },
  });

  const [levelRangeInput, setLevelRangeInput] = useState({ min: 1, max: 17 });

  // Initialize level range input when data loads
  useEffect(() => {
    if (levelRange) {
      setLevelRangeInput({ min: levelRange.min, max: levelRange.max });
    }
  }, [levelRange]);

  const [showAddReward, setShowAddReward] = useState(false);
  const [showEditContent, setShowEditContent] = useState(false);
  const [newReward, setNewReward] = useState({
    playerName: "",
    rewardType: "competition_first" as "competition_first" | "league_first" | "other",
    rewardName: "",
    amount: "",
    rewardTime: new Date().toISOString().slice(0, 16),
  });
  const [editContent, setEditContent] = useState({
    announcement: "",
    rewardMechanism: "",
    clanFeatures: "",
  });
  const [deadlineInput, setDeadlineInput] = useState("");

  // Initialize edit content when contentSettings loads
  useEffect(() => {
    if (contentSettings) {
      setEditContent({
        announcement: contentSettings.announcement,
        rewardMechanism: contentSettings.rewardMechanism,
        clanFeatures: contentSettings.clanFeatures,
      });
    }
  }, [contentSettings]);

  // Initialize deadline input
  useEffect(() => {
    if (settings?.deadline) {
      setDeadlineInput(new Date(settings.deadline).toISOString().slice(0, 16));
    }
  }, [settings]);

  const handleAddReward = () => {
    if (!newReward.playerName.trim()) {
      toast.error("请输入玩家昵称");
      return;
    }
    if (!newReward.rewardName.trim()) {
      toast.error("请输入奖励名称");
      return;
    }
    if (!newReward.amount || parseFloat(newReward.amount) < 0) {
      toast.error("请输入有效金额");
      return;
    }
    if (!newReward.rewardTime) {
      toast.error("请选择奖励时间");
      return;
    }

    createRewardMutation.mutate({
      playerName: newReward.playerName.trim(),
      rewardType: newReward.rewardType,
      rewardName: newReward.rewardName.trim(),
      amount: parseFloat(newReward.amount),
      rewardTime: new Date(newReward.rewardTime).toISOString(),
    });
  };

  const handleExportExcel = () => {
    if (!exportData || exportData.length === 0) {
      toast.error("没有数据可导出");
      return;
    }

    // Create CSV content with Chinese headers
    const headers = ["序号", "游戏昵称", "大本营等级", "备注", "状态", "报名时间"];
    const csvContent = [
      headers.join(","),
      ...exportData.map(row => [
        row.序号,
        `"${row.游戏昵称}"`,
        row.大本营等级,
        `"${row.备注}"`,
        row.状态,
        `"${row.报名时间}"`
      ].join(","))
    ].join("\n");

    // Add BOM for Excel to recognize UTF-8
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `报名列表_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("导出成功");
  };

  const handleSaveDeadline = () => {
    if (deadlineInput) {
      setDeadlineMutation.mutate({ deadline: new Date(deadlineInput).toISOString() });
    } else {
      setDeadlineMutation.mutate({ deadline: null });
    }
  };

  const handleClearDeadline = () => {
    setDeadlineInput("");
    setDeadlineMutation.mutate({ deadline: null });
  };

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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold">管理后台</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{admin.email}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="gaming-card">
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats?.total ?? 0}</p>
                <p className="text-xs text-muted-foreground">总报名</p>
              </CardContent>
            </Card>
            <Card className="gaming-card">
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats?.pending ?? 0}</p>
                <p className="text-xs text-muted-foreground">待审核</p>
              </CardContent>
            </Card>
            <Card className="gaming-card">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats?.approved ?? 0}</p>
                <p className="text-xs text-muted-foreground">已通过</p>
              </CardContent>
            </Card>
            <Card className="gaming-card">
              <CardContent className="p-4 text-center">
                <Gift className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">¥{rewardStats?.totalAmount.toFixed(2) ?? "0.00"}</p>
                <p className="text-xs text-muted-foreground">累计奖励</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="registrations" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="registrations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="w-4 h-4 mr-2" />
                报名管理
              </TabsTrigger>
              <TabsTrigger value="rewards" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Trophy className="w-4 h-4 mr-2" />
                奖励管理
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Settings className="w-4 h-4 mr-2" />
                系统设置
              </TabsTrigger>
            </TabsList>

            {/* Registrations Tab */}
            <TabsContent value="registrations">
              <Card className="gaming-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">报名列表</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportExcel}>
                      <Download className="w-4 h-4 mr-2" />
                      导出Excel
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => refetchRegistrations()}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      刷新
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 text-muted-foreground font-medium text-sm">昵称</th>
                          <th className="text-left p-3 text-muted-foreground font-medium text-sm">大本营</th>
                          <th className="text-left p-3 text-muted-foreground font-medium text-sm">备注</th>
                          <th className="text-left p-3 text-muted-foreground font-medium text-sm">状态</th>
                          <th className="text-left p-3 text-muted-foreground font-medium text-sm">时间</th>
                          <th className="text-left p-3 text-muted-foreground font-medium text-sm">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations && registrations.length > 0 ? (
                          registrations.map((reg) => (
                            <tr key={reg.id} className="border-b border-border hover:bg-card/50">
                              <td className="p-3 font-medium">{reg.gameName}</td>
                              <td className="p-3">{reg.townHallLevel} 本</td>
                              <td className="p-3 text-muted-foreground text-sm max-w-[200px] truncate">
                                {reg.remarks || "-"}
                              </td>
                              <td className="p-3">{getStatusBadge(reg.status)}</td>
                              <td className="p-3 text-muted-foreground text-sm">
                                {new Date(reg.createdAt).toLocaleDateString('zh-CN')}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  {reg.status === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                        onClick={() => updateStatusMutation.mutate({ id: reg.id, status: "approved" })}
                                        disabled={updateStatusMutation.isPending}
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                        onClick={() => updateStatusMutation.mutate({ id: reg.id, status: "rejected" })}
                                        disabled={updateStatusMutation.isPending}
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                      if (confirm("确定要删除这条报名记录吗？")) {
                                        deleteRegistrationMutation.mutate({ id: reg.id });
                                      }
                                    }}
                                    disabled={deleteRegistrationMutation.isPending}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
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
            </TabsContent>

            {/* Rewards Tab */}
            <TabsContent value="rewards">
              <Card className="gaming-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">奖励记录</CardTitle>
                  <Dialog open={showAddReward} onOpenChange={setShowAddReward}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gradient-bg text-black">
                        <Plus className="w-4 h-4 mr-2" />
                        添加奖励
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle>添加奖励记录</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>玩家昵称</Label>
                          <Input
                            placeholder="请输入玩家昵称"
                            value={newReward.playerName}
                            onChange={(e) => setNewReward({ ...newReward, playerName: e.target.value })}
                            className="bg-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>奖励类型</Label>
                          <Select 
                            value={newReward.rewardType} 
                            onValueChange={(v) => setNewReward({ ...newReward, rewardType: v as typeof newReward.rewardType })}
                          >
                            <SelectTrigger className="bg-background border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="competition_first">竞赛第一</SelectItem>
                              <SelectItem value="league_first">联赛第一</SelectItem>
                              <SelectItem value="other">其他奖励</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>奖励名称</Label>
                          <Input
                            placeholder="如：联赛排名第一"
                            value={newReward.rewardName}
                            onChange={(e) => setNewReward({ ...newReward, rewardName: e.target.value })}
                            className="bg-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>金额 (元)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={newReward.amount}
                            onChange={(e) => setNewReward({ ...newReward, amount: e.target.value })}
                            className="bg-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            奖励时间
                          </Label>
                          <Input
                            type="datetime-local"
                            value={newReward.rewardTime}
                            onChange={(e) => setNewReward({ ...newReward, rewardTime: e.target.value })}
                            className="bg-background border-border"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddReward(false)}>取消</Button>
                        <Button 
                          className="gradient-bg text-black" 
                          onClick={handleAddReward}
                          disabled={createRewardMutation.isPending}
                        >
                          {createRewardMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "添加"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rewards && rewards.length > 0 ? (
                      rewards.map((reward) => (
                        <div key={reward.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                          <div className="flex items-center gap-3">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <div>
                              <p className="font-medium">{reward.playerName}</p>
                              <p className="text-sm text-muted-foreground">
                                {getRewardTypeName(reward.rewardType)} · {reward.rewardName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold gradient-text">¥{parseFloat(reward.amount).toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">
                                {reward.rewardTime ? new Date(reward.rewardTime).toLocaleDateString('zh-CN') : new Date(reward.createdAt).toLocaleDateString('zh-CN')}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                if (confirm("确定要删除这条奖励记录吗？")) {
                                  deleteRewardMutation.mutate({ id: reward.id });
                                }
                              }}
                              disabled={deleteRewardMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        暂无奖励记录
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="space-y-6">
                {/* Registration Settings */}
                <Card className="gaming-card">
                  <CardHeader>
                    <CardTitle className="text-lg">报名设置</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                      <div>
                        <p className="font-medium">报名开关</p>
                        <p className="text-sm text-muted-foreground">
                          {settings?.isOpen ? "报名已开启，玩家可以提交报名" : "报名已关闭，玩家无法提交报名"}
                        </p>
                      </div>
                      <Switch
                        checked={settings?.isOpen ?? false}
                        onCheckedChange={(checked) => setRegistrationOpenMutation.mutate({ open: checked })}
                        disabled={setRegistrationOpenMutation.isPending}
                      />
                    </div>

                    <div className="p-4 rounded-lg bg-background border border-border">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            报名截止时间
                          </p>
                          <p className="text-sm text-muted-foreground">
                            当前：{settings?.deadline ? new Date(settings.deadline).toLocaleString('zh-CN') : "未设置"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="datetime-local"
                          value={deadlineInput}
                          onChange={(e) => setDeadlineInput(e.target.value)}
                          className="bg-card border-border flex-1"
                        />
                        <Button 
                          size="sm" 
                          onClick={handleSaveDeadline}
                          disabled={setDeadlineMutation.isPending}
                          className="gradient-bg text-black"
                        >
                          保存
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleClearDeadline}
                          disabled={setDeadlineMutation.isPending}
                        >
                          清除
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Content Settings */}
                <Card className="gaming-card">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">内容管理</CardTitle>
                    <Dialog open={showEditContent} onOpenChange={setShowEditContent}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          编辑内容
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>编辑网站内容</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                          <div className="space-y-2">
                            <Label>部落公告</Label>
                            <Textarea
                              placeholder="输入部落公告内容"
                              value={editContent.announcement}
                              onChange={(e) => setEditContent({ ...editContent, announcement: e.target.value })}
                              className="bg-background border-border min-h-[80px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>奖励机制</Label>
                            <Textarea
                              placeholder="输入奖励机制说明"
                              value={editContent.rewardMechanism}
                              onChange={(e) => setEditContent({ ...editContent, rewardMechanism: e.target.value })}
                              className="bg-background border-border min-h-[80px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>部落特色</Label>
                            <Textarea
                              placeholder="输入部落特色介绍"
                              value={editContent.clanFeatures}
                              onChange={(e) => setEditContent({ ...editContent, clanFeatures: e.target.value })}
                              className="bg-background border-border min-h-[100px]"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowEditContent(false)}>取消</Button>
                          <Button 
                            className="gradient-bg text-black" 
                            onClick={() => updateContentMutation.mutate(editContent)}
                            disabled={updateContentMutation.isPending}
                          >
                            {updateContentMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "保存"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <p className="font-medium text-sm text-muted-foreground mb-1">部落公告</p>
                      <p className="text-foreground">{contentSettings?.announcement}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <p className="font-medium text-sm text-muted-foreground mb-1">奖励机制</p>
                      <p className="text-foreground">{contentSettings?.rewardMechanism}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <p className="font-medium text-sm text-muted-foreground mb-1">部落特色</p>
                      <p className="text-foreground whitespace-pre-line">{contentSettings?.clanFeatures}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Town Hall Level Range Settings */}
                <Card className="gaming-card">
                  <CardHeader>
                    <CardTitle className="text-lg">大本营等级范围</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <p className="font-medium text-sm text-muted-foreground mb-4">
                        当前范围：{levelRange?.min || 1} 本 - {levelRange?.max || 17} 本
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>最低等级</Label>
                          <Input
                            type="number"
                            min="1"
                            max="30"
                            value={levelRangeInput.min}
                            onChange={(e) => setLevelRangeInput({ ...levelRangeInput, min: parseInt(e.target.value) || 1 })}
                            className="bg-card border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>最高等级</Label>
                          <Input
                            type="number"
                            min="1"
                            max="30"
                            value={levelRangeInput.max}
                            onChange={(e) => setLevelRangeInput({ ...levelRangeInput, max: parseInt(e.target.value) || 17 })}
                            className="bg-card border-border"
                          />
                        </div>
                      </div>
                      <Button 
                        className="gradient-bg text-black mt-4 w-full" 
                        onClick={() => setLevelRangeMutation.mutate(levelRangeInput)}
                        disabled={setLevelRangeMutation.isPending}
                      >
                        {setLevelRangeMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "保存等级范围"
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      设置报名表单中大本营等级的可选范围。当游戏更新推出更高等级大本营时，可以在此调整。
                    </p>
                  </CardContent>
                </Card>

                {/* Admin Info */}
                <Card className="gaming-card">
                  <CardContent className="p-4">
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="font-medium text-primary mb-2">管理员信息</p>
                      <p className="text-sm text-muted-foreground">
                        当前登录：{admin.email}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
