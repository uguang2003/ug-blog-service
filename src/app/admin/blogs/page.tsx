/**
 * @description: 博客列表页。支持按标题搜索、按分类过滤、分页，提供编辑/删除入口。
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */
'use client';
import * as React from 'react';
import Link from 'next/link';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { adminFetch } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { useConfirm } from '@/components/admin/ConfirmDialog';
import { Pagination } from '@/components/admin/Pagination';

interface BlogItem {
  id: number;
  title: string | null;
  published: boolean;
  recommend: boolean;
  views: number | null;
  updateTime: string | null;
  type: { id: number; name: string } | null;
  user: { id: number; username: string | null; nickname: string | null } | null;
  _count?: { comments: number };
}
interface BlogListResp {
  blogs: BlogItem[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}
interface TypeItem { id: number; name: string }

export default function BlogsPage() {
  const { show } = useToast();
  const confirm = useConfirm();
  const [page, setPage] = React.useState(1);
  const [titleFilter, setTitleFilter] = React.useState('');
  const [titleInput, setTitleInput] = React.useState('');
  const [typeId, setTypeId] = React.useState<string>('');
  const [list, setList] = React.useState<BlogListResp | null>(null);
  const [types, setTypes] = React.useState<TypeItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    adminFetch<TypeItem[]>('/api/admin/types').then(setTypes).catch(() => {});
  }, []);

  const load = React.useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), pageSize: '10' });
    if (titleFilter) qs.set('title', titleFilter);
    if (typeId) qs.set('typeId', typeId);
    adminFetch<BlogListResp>(`/api/admin/blogs?${qs.toString()}`)
      .then(setList)
      .catch((e) => show({ type: 'error', message: e.message }))
      .finally(() => setLoading(false));
  }, [page, titleFilter, typeId, show]);

  React.useEffect(() => { load(); }, [load]);

  const onSearch = () => {
    setPage(1);
    setTitleFilter(titleInput.trim());
  };

  const onDelete = async (b: BlogItem) => {
    const ok = await confirm({
      title: '确认删除',
      description: `博客《${b.title ?? '(无标题)'}》将被删除，且无法恢复。`,
      confirmText: '删除',
      destructive: true,
    });
    if (!ok) return;
    try {
      await adminFetch(`/api/admin/blogs/${b.id}`, { method: 'DELETE' });
      show({ type: 'success', message: '删除成功' });
      load();
    } catch (e) {
      show({ type: 'error', message: (e as Error).message });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">博客管理</h1>
          <p className="mt-1 text-sm text-slate-500">管理你已发布与草稿的博客</p>
        </div>
        <Link href="/admin/blogs/new">
          <Button>
            <Plus className="h-4 w-4" />
            新增博客
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                placeholder="按标题搜索"
                className="pl-10"
              />
            </div>
            <select
              value={typeId}
              onChange={(e) => { setPage(1); setTypeId(e.target.value); }}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">全部分类</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <Button onClick={onSearch}>搜索</Button>
            <Button
              variant="outline"
              onClick={() => { setTitleInput(''); setTitleFilter(''); setTypeId(''); setPage(1); }}
            >
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">标题</th>
                <th className="px-4 py-3 text-left font-medium">分类</th>
                <th className="px-4 py-3 text-left font-medium">状态</th>
                <th className="px-4 py-3 text-left font-medium">浏览</th>
                <th className="px-4 py-3 text-left font-medium">评论</th>
                <th className="px-4 py-3 text-left font-medium">更新时间</th>
                <th className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">加载中…</td></tr>
              )}
              {!loading && list?.blogs.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">暂无数据</td></tr>
              )}
              {list?.blogs.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-500">{b.id}</td>
                  <td className="px-4 py-3 max-w-md truncate">
                    <div className="font-medium text-slate-900 truncate">{b.title ?? '(无标题)'}</div>
                  </td>
                  <td className="px-4 py-3">
                    {b.type ? <Badge tone="olive">{b.type.name}</Badge> : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Badge tone={b.published ? 'green' : 'slate'}>
                        {b.published ? '已发布' : '草稿'}
                      </Badge>
                      {b.recommend && <Badge tone="amber">推荐</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{b.views ?? 0}</td>
                  <td className="px-4 py-3 text-slate-600">{b._count?.comments ?? 0}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {b.updateTime ? new Date(b.updateTime).toLocaleString('zh-CN') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Link href={`/admin/blogs/${b.id}`}>
                        <Button size="sm" variant="outline">
                          <Pencil className="h-3.5 w-3.5" />
                          编辑
                        </Button>
                      </Link>
                      <Button size="sm" variant="danger" onClick={() => onDelete(b)}>
                        <Trash2 className="h-3.5 w-3.5" />
                        删除
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 p-4">
          {list && (
            <Pagination
              page={list.pagination.page}
              total={list.pagination.total}
              totalPages={list.pagination.totalPages}
              onChange={setPage}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
