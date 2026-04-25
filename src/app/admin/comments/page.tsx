/**
 * @description: 评论管理页。分页列表，关键字搜索，单条删除。
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */
'use client';
import * as React from 'react';
import { Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminFetch } from '@/lib/admin-auth';
import { useToast } from '@/components/ui/toast';
import { useConfirm } from '@/components/admin/ConfirmDialog';
import { Pagination } from '@/components/admin/Pagination';

interface Comment {
  id: number;
  nickname: string | null;
  email: string | null;
  content: string | null;
  avatar: string | null;
  createTime: string | null;
  blogId: number | null;
  parentCommentId: number | null;
  adminComment: boolean;
  blog: { id: number; title: string | null } | null;
  parentComment: { id: number; nickname: string | null } | null;
}
interface ListResp {
  comments: Comment[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export default function CommentsPage() {
  const { show } = useToast();
  const confirm = useConfirm();
  const [page, setPage] = React.useState(1);
  const [keywordInput, setKeywordInput] = React.useState('');
  const [keyword, setKeyword] = React.useState('');
  const [list, setList] = React.useState<ListResp | null>(null);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), pageSize: '15' });
    if (keyword) qs.set('keyword', keyword);
    adminFetch<ListResp>(`/api/admin/comments?${qs.toString()}`)
      .then(setList)
      .catch((e) => show({ type: 'error', message: e.message }))
      .finally(() => setLoading(false));
  }, [page, keyword, show]);

  React.useEffect(() => { load(); }, [load]);

  const onSearch = () => {
    setPage(1);
    setKeyword(keywordInput.trim());
  };

  const onDelete = async (c: Comment) => {
    const ok = await confirm({
      title: '确认删除评论',
      description: `「${c.nickname ?? '匿名'}」的评论将被删除。`,
      confirmText: '删除',
      destructive: true,
    });
    if (!ok) return;
    try {
      await adminFetch(`/api/admin/comments/${c.id}`, { method: 'DELETE' });
      show({ type: 'success', message: '已删除' });
      load();
    } catch (e) {
      show({ type: 'error', message: (e as Error).message });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">评论管理</h1>
        <p className="mt-1 text-sm text-slate-500">查看并清理博客评论</p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-2 p-4">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder="按昵称、邮箱、内容搜索"
              className="pl-10"
            />
          </div>
          <Button onClick={onSearch}>搜索</Button>
          <Button variant="outline" onClick={() => { setKeywordInput(''); setKeyword(''); setPage(1); }}>
            重置
          </Button>
        </CardContent>
      </Card>

      <Card>
        <div className="divide-y divide-slate-100">
          {loading && <div className="px-4 py-8 text-center text-slate-400">加载中…</div>}
          {!loading && list?.comments.length === 0 && (
            <div className="px-4 py-8 text-center text-slate-400">暂无数据</div>
          )}
          {list?.comments.map((c) => (
            <div key={c.id} className="flex gap-4 p-4">
              {c.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.avatar} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-slate-900">{c.nickname ?? '匿名'}</span>
                  {c.adminComment && <Badge tone="teal">管理员</Badge>}
                  {c.email && <span className="text-slate-500">&lt;{c.email}&gt;</span>}
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">
                    {c.createTime ? new Date(c.createTime).toLocaleString('zh-CN') : '—'}
                  </span>
                </div>
                <div className="mt-1 text-sm text-slate-700 whitespace-pre-line">
                  {c.content ?? ''}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {c.blog && (
                    <span>评论博客：<span className="text-slate-700">{c.blog.title ?? `#${c.blog.id}`}</span></span>
                  )}
                  {c.parentComment && (
                    <span>· 回复 @{c.parentComment.nickname ?? `#${c.parentComment.id}`}</span>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                <Button size="sm" variant="danger" onClick={() => onDelete(c)}>
                  <Trash2 className="h-3.5 w-3.5" />
                  删除
                </Button>
              </div>
            </div>
          ))}
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
