import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Shield, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Register() {
  const [, setLocation] = useLocation();
  const { data: settings } = trpc.settings.getRegistrationStatus.useQuery();
  const { data: levelRange } = trpc.settings.getTownHallLevelRange.useQuery();
  
  const [gameName, setGameName] = useState("");
  const [townHallLevel, setTownHallLevel] = useState<string>("");
  const [remarks, setRemarks] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createMutation = trpc.registration.create.useMutation({
    onSuccess: () => {
      setErrorMessage(null);
      setSuccessMessage("报名成功！请等待管理员审核。即将跳转到报名列表...");
      toast.success("报名成功！请等待管理员审核。");
      setTimeout(() => {
        setLocation("/registrations");
      }, 2000);
    },
    onError: (error) => {
      setSuccessMessage(null);
      setErrorMessage(error.message || "报名失败，请稍后重试");
      toast.error(error.message || "报名失败，请稍后重试");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    
    if (!gameName.trim()) {
      setErrorMessage("请输入游戏昵称");
      toast.error("请输入游戏昵称");
      return;
    }
    
    if (!townHallLevel) {
      setErrorMessage("请选择大本营等级");
      toast.error("请选择大本营等级");
      return;
    }

    createMutation.mutate({
      gameName: gameName.trim(),
      townHallLevel: parseInt(townHallLevel),
      remarks: remarks.trim() || undefined,
    });
  };

  const isOpen = settings?.isOpen ?? false;
  const deadline = settings?.deadline ? new Date(settings.deadline) : null;
  const isExpired = deadline ? deadline < new Date() : false;

  const minLevel = levelRange?.min || 1;
  const maxLevel = levelRange?.max || 17;
  const townHallLevels = Array.from({ length: maxLevel - minLevel + 1 }, (_, i) => minLevel + i);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center h-16">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="container max-w-lg">
          <Card className="gaming-card">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <CardTitle className="text-2xl gradient-text">联赛报名</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                请填写您的游戏信息，带 * 的为必填项
              </p>
              {deadline && (
                <p className="text-sm text-primary mt-2">
                  截止时间：{deadline.toLocaleString('zh-CN')}
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {!isOpen || isExpired ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {isExpired ? "报名已截止" : "报名已关闭"}
                  </p>
                  <Link href="/">
                    <Button variant="outline">返回首页</Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {errorMessage && (
                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-400">
                        {errorMessage}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Success Message */}
                  {successMessage && (
                    <Alert className="bg-green-500/10 border-green-500/30">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-400">
                        {successMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="gameName" className="flex items-center gap-1">
                      <span className="text-primary">🎮</span>
                      游戏昵称 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="gameName"
                      placeholder="请输入您的游戏昵称"
                      value={gameName}
                      onChange={(e) => setGameName(e.target.value)}
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <span className="text-primary">🏰</span>
                      大本营等级 <span className="text-destructive">*</span>
                    </Label>
                    <Select value={townHallLevel} onValueChange={setTownHallLevel}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="请选择大本营等级" />
                      </SelectTrigger>
                      <SelectContent>
                        {townHallLevels.map((level) => (
                          <SelectItem key={level} value={level.toString()}>
                            {level} 本
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks" className="flex items-center gap-1">
                      <span className="text-primary">📝</span>
                      备注信息（选填）
                    </Label>
                    <Textarea
                      id="remarks"
                      placeholder="请输入任何需要说明的信息..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="bg-background border-border min-h-[100px]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full gradient-bg text-black font-semibold"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        提交报名
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
