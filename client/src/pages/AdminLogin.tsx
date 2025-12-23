import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Lock, Mail, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { data: admin, isLoading: checkingAuth } = trpc.admin.me.useQuery();

  const utils = trpc.useUtils();

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: () => {
      toast.success("登录成功！");
      utils.admin.me.invalidate();
      setTimeout(() => {
        setLocation("/admin");
      }, 100);
    },
    onError: (error) => {
      toast.error(error.message || "登录失败，请检查账号密码");
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (admin) {
      setLocation("/admin");
    }
  }, [admin, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("请输入邮箱");
      return;
    }
    
    if (!password) {
      toast.error("请输入密码");
      return;
    }

    loginMutation.mutate({ email: email.trim(), password });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
      <main className="pt-24 pb-16 flex items-center justify-center min-h-screen">
        <div className="container max-w-md">
          <Card className="gaming-card">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <CardTitle className="text-2xl gradient-text">管理员登录</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                请输入管理员账号和密码
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    邮箱账号
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="请输入管理员邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    密码
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full gradient-bg text-black font-semibold"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      登录中...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      登录
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-center text-muted-foreground">
                  仅限管理员登录，普通用户无需登录即可报名
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
