/**
 * @description: 后台仪表盘。展示博客/评论/分类/用户等核心统计与最近 7 天发文趋势。
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */
'use client';
import * as React from 'react';
import Link from 'next/link';
import { FileText, MessageSquare, FolderKanban, Users, Eye, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { adminFetch } from '@/lib/admin-auth';
import { useToast } from '@/components/ui/toast';

interface Stats {
  totalBlogs: number;
  publishedBlogs: number;
  totalComments: number;
  totalUsers: number;
  totalTypes: number;
  recentBlogStats: Record<string, number>;
}

const STAT_CARDS: { key: keyof Stats; label: string; icon: React.ComponentType<{ className?: string }>; tone: string }[] = [
  { key: 'totalBlogs', label: '博客总数', icon: FileText, tone: 'text-teal-600 bg-teal-50' },
  { key: 'publishedBlogs', label: '已发布', icon: Eye, tone: 'text-emerald-600 bg-emerald-50' },
  { key: 'totalComments', label: '评论数', icon: MessageSquare, tone: 'text-sky-600 bg-sky-50' },
  { key: 'totalTypes', label: '分类数', icon: FolderKanban, tone: 'text-amber-600 bg-amber-50' },
  { key: 'totalUsers', label: '用户数', icon: Users, tone: 'text-purple-600 bg-purple-50' },
];

export default function DashboardPage() {
  const { show } = useToast();
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    adminFetch<Stats>('/api/admin/stats')
      .then(setStats)
      .catch((e) => show({ type: 'error', message: e.message }))
      .finally(() => setLoading(false));
  }, [show]);

  // 7 天日期序列
  const days = React.useMemo(() => {
    const arr: { date: string; label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = d.toISOString().slice(0, 10);
      arr.push({
        date,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        count: stats?.recentBlogStats?.[date] ?? 0,
      });
    }
    return arr;
  }, [stats]);

  const maxCount = Math.max(1, ...days.map((d) => d.count));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">仪表盘</h1>
        <p className="mt-1 text-sm text-slate-500">查看博客全局概况</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STAT_CARDS.map(({ key, label, icon: Icon, tone }) => (
          <Card key={key}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg p-3 ${tone}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm text-slate-500">{label}</div>
                <div className="text-2xl font-bold text-slate-900">
                  {loading ? '—' : (stats?.[key] as number) ?? 0}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            最近 7 天发文
          </CardTitle>
          <CardDescription>按创建日期统计的博客数量</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-48">
            {days.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div className="text-xs text-slate-500">{d.count}</div>
                <div
                  className="w-full rounded-t-md bg-teal-500/80 transition-all"
                  style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: 4 }}
                />
                <div className="text-xs text-slate-400">{d.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>快捷入口</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/blogs/new" className="rounded-lg border border-slate-200 p-4 hover:border-teal-400 hover:bg-teal-50 transition-colors">
            <div className="font-medium text-slate-900">写新博客</div>
            <div className="mt-1 text-xs text-slate-500">发布或保存为草稿</div>
          </Link>
          <Link href="/admin/types" className="rounded-lg border border-slate-200 p-4 hover:border-teal-400 hover:bg-teal-50 transition-colors">
            <div className="font-medium text-slate-900">分类管理</div>
            <div className="mt-1 text-xs text-slate-500">维护博客分类</div>
          </Link>
          <Link href="/admin/pictures" className="rounded-lg border border-slate-200 p-4 hover:border-teal-400 hover:bg-teal-50 transition-colors">
            <div className="font-medium text-slate-900">相册管理</div>
            <div className="mt-1 text-xs text-slate-500">上传与编辑照片</div>
          </Link>
          <Link href="/admin/comments" className="rounded-lg border border-slate-200 p-4 hover:border-teal-400 hover:bg-teal-50 transition-colors">
            <div className="font-medium text-slate-900">评论管理</div>
            <div className="mt-1 text-xs text-slate-500">查看与删除评论</div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
