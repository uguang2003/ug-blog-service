/**
 * @description: 分类管理页。新增/重命名/删除（仅当无博客引用时可删）。
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */
'use client';
import * as React from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminFetch } from '@/lib/admin-auth';
import { useToast } from '@/components/ui/toast';
import { useConfirm } from '@/components/admin/ConfirmDialog';

interface TypeItem {
  id: number;
  name: string;
  _count?: { blogs: number };
}

export default function TypesPage() {
  const { show } = useToast();
  const confirm = useConfirm();
  const [types, setTypes] = React.useState<TypeItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newName, setNewName] = React.useState('');
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editingName, setEditingName] = React.useState('');

  const load = React.useCallback(() => {
    setLoading(true);
    adminFetch<TypeItem[]>('/api/admin/types')
      .then(setTypes)
      .catch((e) => show({ type: 'error', message: e.message }))
      .finally(() => setLoading(false));
  }, [show]);

  React.useEffect(() => { load(); }, [load]);

  const onCreate = async () => {
    if (!newName.trim()) return show({ type: 'error', message: '请输入分类名称' });
    try {
      await adminFetch('/api/admin/types', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim() }),
      });
      show({ type: 'success', message: '已新增' });
      setNewName('');
      load();
    } catch (e) {
      show({ type: 'error', message: (e as Error).message });
    }
  };

  const startEdit = (t: TypeItem) => {
    setEditingId(t.id);
    setEditingName(t.name);
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    if (!editingName.trim()) return show({ type: 'error', message: '名称不能为空' });
    try {
      await adminFetch(`/api/admin/types/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editingName.trim() }),
      });
      show({ type: 'success', message: '已更新' });
      setEditingId(null);
      load();
    } catch (e) {
      show({ type: 'error', message: (e as Error).message });
    }
  };

  const onDelete = async (t: TypeItem) => {
    const ok = await confirm({
      title: '确认删除分类',
      description: `「${t.name}」将被删除${t._count?.blogs ? `；该分类下还有 ${t._count.blogs} 篇博客，需先转移` : ''}。`,
      confirmText: '删除',
      destructive: true,
    });
    if (!ok) return;
    try {
      await adminFetch(`/api/admin/types/${t.id}`, { method: 'DELETE' });
      show({ type: 'success', message: '已删除' });
      load();
    } catch (e) {
      show({ type: 'error', message: (e as Error).message });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">分类管理</h1>
        <p className="mt-1 text-sm text-slate-500">维护博客所属分类</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onCreate()}
              placeholder="新分类名称"
              className="max-w-xs"
            />
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4" />
              新增
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium w-20">ID</th>
                <th className="px-4 py-3 text-left font-medium">名称</th>
                <th className="px-4 py-3 text-left font-medium w-32">博客数</th>
                <th className="px-4 py-3 text-right font-medium w-48">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">加载中…</td></tr>}
              {!loading && types.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">暂无数据</td></tr>
              )}
              {types.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-500">{t.id}</td>
                  <td className="px-4 py-3">
                    {editingId === t.id ? (
                      <Input
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        className="max-w-xs"
                      />
                    ) : (
                      <span className="font-medium text-slate-900">{t.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="olive">{t._count?.blogs ?? 0}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      {editingId === t.id ? (
                        <>
                          <Button size="sm" onClick={saveEdit}>
                            <Check className="h-3.5 w-3.5" />
                            保存
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            <X className="h-3.5 w-3.5" />
                            取消
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => startEdit(t)}>
                            <Pencil className="h-3.5 w-3.5" />
                            编辑
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => onDelete(t)}>
                            <Trash2 className="h-3.5 w-3.5" />
                            删除
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
