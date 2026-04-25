/**
 * @description: 博客编辑页。从 /api/admin/blogs/[id] 加载详情后传给 BlogEditor。
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */
'use client';
import * as React from 'react';
import { useParams } from 'next/navigation';
import { BlogEditor, type BlogFormData } from '@/components/admin/BlogEditor';
import { adminFetch } from '@/lib/admin-auth';
import { useToast } from '@/components/ui/toast';

interface BlogDetail {
  id: number;
  title: string | null;
  content: string | null;
  description: string | null;
  firstPicture: string | null;
  flag: string | null;
  typeId: number | null;
  published: boolean;
  recommend: boolean;
  appreciation: boolean;
  shareStatement: boolean;
  commentabled: boolean;
}

export default function EditBlogPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { show } = useToast();
  const [data, setData] = React.useState<BlogFormData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    adminFetch<BlogDetail>(`/api/admin/blogs/${id}`)
      .then((b) => {
        setData({
          id: b.id,
          title: b.title ?? '',
          content: b.content ?? '',
          description: b.description ?? '',
          firstPicture: b.firstPicture ?? '',
          flag: b.flag ?? '原创',
          typeId: b.typeId ?? '',
          published: b.published,
          recommend: b.recommend,
          appreciation: b.appreciation,
          shareStatement: b.shareStatement,
          commentabled: b.commentabled,
        });
      })
      .catch((e) => show({ type: 'error', message: (e as Error).message }))
      .finally(() => setLoading(false));
  }, [id, show]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }
  if (!data) {
    return <div className="text-slate-500">未找到博客</div>;
  }
  return <BlogEditor initial={data} blogId={id} />;
}
