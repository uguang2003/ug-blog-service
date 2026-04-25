/**
 * @description: 博客新增/编辑表单。Markdown 编辑器使用 @uiw/react-md-editor 动态加载（避免 SSR）。
 *               同时承担 POST /api/admin/blogs 与 PUT /api/admin/blogs/[id] 两种用途。
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */
'use client';
import * as React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Save, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { adminFetch } from '@/lib/admin-auth';
import { useToast } from '@/components/ui/toast';

// 动态加载 Markdown 编辑器，关闭 SSR
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });
import '@uiw/react-md-editor/markdown-editor.css';

const FLAGS = ['原创', '转载', '翻译'] as const;

export interface BlogFormData {
  id?: number;
  title: string;
  content: string;
  description: string;
  firstPicture: string;
  flag: string;
  typeId: number | '';
  published: boolean;
  recommend: boolean;
  appreciation: boolean;
  shareStatement: boolean;
  commentabled: boolean;
}

interface TypeItem { id: number; name: string }

const emptyForm: BlogFormData = {
  title: '',
  content: '',
  description: '',
  firstPicture: '',
  flag: '原创',
  typeId: '',
  published: false,
  recommend: false,
  appreciation: false,
  shareStatement: false,
  commentabled: true,
};

export function BlogEditor({ initial, blogId }: { initial?: BlogFormData; blogId?: number }) {
  const router = useRouter();
  const { show } = useToast();
  const [form, setForm] = React.useState<BlogFormData>(initial ?? emptyForm);
  const [types, setTypes] = React.useState<TypeItem[]>([]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    adminFetch<TypeItem[]>('/api/admin/types').then(setTypes).catch(() => {});
  }, []);

  const update = <K extends keyof BlogFormData>(key: K, value: BlogFormData[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const submit = async (publish: boolean) => {
    if (!form.title.trim()) return show({ type: 'error', message: '请填写标题' });
    if (!form.typeId) return show({ type: 'error', message: '请选择分类' });
    if (!form.content.trim()) return show({ type: 'error', message: '请填写正文' });

    const payload = { ...form, published: publish, typeId: Number(form.typeId) };
    setSaving(true);
    try {
      if (blogId) {
        await adminFetch(`/api/admin/blogs/${blogId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch('/api/admin/blogs', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      show({ type: 'success', message: publish ? '已发布' : '已保存为草稿' });
      router.push('/admin/blogs');
    } catch (e) {
      show({ type: 'error', message: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
            aria-label="返回"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{blogId ? '编辑博客' : '新增博客'}</h1>
            <p className="mt-1 text-sm text-slate-500">填写完成后可保存为草稿或直接发布</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => submit(false)} loading={saving && !form.published}>
            <Save className="h-4 w-4" />
            保存草稿
          </Button>
          <Button onClick={() => submit(true)} loading={saving && form.published}>
            <Send className="h-4 w-4" />
            发布
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-4 lg:grid-cols-[140px_1fr]">
            <div>
              <Label className="mb-1.5 block">标识</Label>
              <select
                value={form.flag}
                onChange={(e) => update('flag', e.target.value)}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {FLAGS.map((f) => (<option key={f} value={f}>{f}</option>))}
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block">标题 <span className="text-red-500">*</span></Label>
              <Input
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="给博客起个吸睛的标题"
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block">正文 <span className="text-red-500">*</span></Label>
            <div data-color-mode="light">
              <MDEditor
                value={form.content}
                onChange={(v) => update('content', v ?? '')}
                height={520}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">分类 <span className="text-red-500">*</span></Label>
              <select
                value={form.typeId}
                onChange={(e) => update('typeId', e.target.value ? Number(e.target.value) : '')}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">请选择分类</option>
                {types.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
              </select>
            </div>
            <div>
              <Label className="mb-1.5 block">首图地址</Label>
              <Input
                value={form.firstPicture}
                onChange={(e) => update('firstPicture', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block">摘要描述</Label>
            <Textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="一句话说明博客主旨（最多 200 字）"
              maxLength={200}
              rows={3}
            />
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
            {([
              ['recommend', '推荐'],
              ['shareStatement', '转载声明'],
              ['appreciation', '允许赞赏'],
              ['commentabled', '允许评论'],
            ] as [keyof BlogFormData, string][]).map(([key, label]) => (
              <label key={key as string} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(form[key])}
                  onChange={(e) => update(key, e.target.checked as never)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                {label}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
