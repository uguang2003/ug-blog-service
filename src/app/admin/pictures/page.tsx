/**
 * @description: 相册管理页。卡片网格展示，支持新增/编辑/删除。
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */
'use client';
import * as React from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { adminFetch } from '@/lib/admin-auth';
import { useToast } from '@/components/ui/toast';
import { useConfirm } from '@/components/admin/ConfirmDialog';
import { Pagination } from '@/components/admin/Pagination';

interface Picture {
  id: number;
  pictureAddress: string | null;
  pictureDescription: string | null;
  pictureName: string | null;
  pictureTime: string | null;
}
interface ListResp {
  pictures: Picture[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

const empty: Omit<Picture, 'id'> = {
  pictureAddress: '',
  pictureDescription: '',
  pictureName: '',
  pictureTime: '',
};

export default function PicturesPage() {
  const { show } = useToast();
  const confirm = useConfirm();
  const [page, setPage] = React.useState(1);
  const [list, setList] = React.useState<ListResp | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState<Picture | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [form, setForm] = React.useState<Omit<Picture, 'id'>>(empty);

  const load = React.useCallback(() => {
    setLoading(true);
    adminFetch<ListResp>(`/api/admin/pictures?page=${page}&pageSize=12`)
      .then(setList)
      .catch((e) => show({ type: 'error', message: e.message }))
      .finally(() => setLoading(false));
  }, [page, show]);

  React.useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setCreating(true);
  };
  const openEdit = (p: Picture) => {
    setEditing(p);
    setForm({
      pictureAddress: p.pictureAddress ?? '',
      pictureDescription: p.pictureDescription ?? '',
      pictureName: p.pictureName ?? '',
      pictureTime: p.pictureTime ?? '',
    });
    setCreating(true);
  };
  const closeForm = () => { setCreating(false); setEditing(null); };

  const submit = async () => {
    if (!form.pictureAddress?.trim()) return show({ type: 'error', message: '图片地址不能为空' });
    try {
      if (editing) {
        await adminFetch(`/api/admin/pictures/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
        show({ type: 'success', message: '已保存' });
      } else {
        await adminFetch('/api/admin/pictures', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        show({ type: 'success', message: '已新增' });
      }
      closeForm();
      load();
    } catch (e) {
      show({ type: 'error', message: (e as Error).message });
    }
  };

  const onDelete = async (p: Picture) => {
    const ok = await confirm({
      title: '确认删除',
      description: `图片「${p.pictureName ?? p.id}」将被删除。`,
      confirmText: '删除',
      destructive: true,
    });
    if (!ok) return;
    try {
      await adminFetch(`/api/admin/pictures/${p.id}`, { method: 'DELETE' });
      show({ type: 'success', message: '已删除' });
      load();
    } catch (e) {
      show({ type: 'error', message: (e as Error).message });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">相册管理</h1>
          <p className="mt-1 text-sm text-slate-500">添加、修改与删除照片</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          新增照片
        </Button>
      </div>

      {loading && <div className="text-slate-400">加载中…</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list?.pictures.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="aspect-video bg-slate-100">
              {p.pictureAddress ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.pictureAddress}
                  alt={p.pictureName ?? ''}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : null}
            </div>
            <CardContent className="space-y-2 p-4">
              <div className="font-medium text-slate-900 truncate">{p.pictureName ?? '(未命名)'}</div>
              <div className="text-xs text-slate-500">{p.pictureTime ?? '—'}</div>
              <div className="text-sm text-slate-600 line-clamp-2 min-h-[2.5em]">
                {p.pictureDescription ?? '—'}
              </div>
              <div className="flex justify-end gap-1 pt-1">
                <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="danger" onClick={() => onDelete(p)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          {list && (
            <Pagination
              page={list.pagination.page}
              total={list.pagination.total}
              totalPages={list.pagination.totalPages}
              onChange={setPage}
            />
          )}
        </CardContent>
      </Card>

      {creating && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-lg">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <h2 className="font-semibold text-slate-900">{editing ? '编辑照片' : '新增照片'}</h2>
              <button onClick={closeForm} className="rounded p-1 text-slate-500 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <CardContent className="space-y-3 p-4">
              <div>
                <Label className="mb-1.5 block">名称</Label>
                <Input
                  value={form.pictureName ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, pictureName: e.target.value }))}
                  placeholder="给照片起个名"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">图片地址 <span className="text-red-500">*</span></Label>
                <Input
                  value={form.pictureAddress ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, pictureAddress: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label className="mb-1.5 block">时间地点</Label>
                <Input
                  value={form.pictureTime ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, pictureTime: e.target.value }))}
                  placeholder="例：2026年1月 南昌"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">描述</Label>
                <Textarea
                  value={form.pictureDescription ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, pictureDescription: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 border-t border-slate-100 p-4">
              <Button variant="outline" onClick={closeForm}>取消</Button>
              <Button onClick={submit}>保存</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
