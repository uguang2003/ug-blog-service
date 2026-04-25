/**
 * @description: 后台登录页。账号密码登录，成功后将 token 与用户信息写入 localStorage。
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */
'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { setToken, setUser, type AdminUser } from '@/lib/admin-auth';
import { useToast } from '@/components/ui/toast';

interface LoginResponse {
  token: string;
  user: AdminUser;
}

export default function LoginPage() {
  const router = useRouter();
  const { show } = useToast();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      show({ type: 'error', message: '请填写用户名和密码' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        show({ type: 'error', message: data?.error ?? '登录失败' });
        return;
      }
      const { token, user } = data as LoginResponse;
      if (user.type !== 1) {
        show({ type: 'error', message: '该账号无管理员权限' });
        return;
      }
      setToken(token);
      setUser(user);
      show({ type: 'success', message: '登录成功' });
      router.replace('/admin');
    } catch {
      show({ type: 'error', message: '网络异常，请稍后再试' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-teal-50 to-lime-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-wide text-slate-900">UG666 博客管理后台</h1>
          <p className="mt-2 text-sm text-slate-500">使用管理员账号登录以继续</p>
        </div>
        <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">用户名</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  placeholder="请输入用户名"
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">密码</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="请输入密码"
                  autoComplete="current-password"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              <LogIn className="h-4 w-4" />
              登录
            </Button>
          </div>
        </form>
        <p className="mt-6 text-center text-xs text-slate-400">© {new Date().getFullYear()} UG666</p>
      </div>
    </div>
  );
}
