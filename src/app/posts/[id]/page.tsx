// src/app/posts/[id]/page.tsx

import prisma from '@/lib/prisma';
import Link from 'next/link'; // 导入 Link 组件用于导航

// 定义 Props 类型，这样 TypeScript 就能知道 params 里有什么
type PostPageProps = {
  params: {
    id: string; // URL 中的动态部分 [id] 会作为字符串传递进来
  };
};

// 这也是一个 Server Component，同样可以直接访问数据库
export default async function PostPage({ params }: PostPageProps) {
  const { id } = params;

  // 使用 id 查询单个 post
  // 注意：params.id 是字符串，但数据库里的 id 是 Int，
  // Prisma 的 findUnique 会自动处理类型转换，但最佳实践是手动转换
  const post = await prisma.post.findUnique({
    where: {
      id: parseInt(id), // 将字符串 id 转换为数字
    },
  });

  // 如果找不到文章，显示一个提示信息
  if (!post) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>文章未找到</h1>
        <p>抱歉，我们找不到您要查找的文章。</p>
        <Link href="/">返回首页</Link>
      </main>
    );
  }

  // 如果找到了文章，就显示它的详细内容
  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <Link href="/" style={{ marginBottom: '2rem', display: 'inline-block' }}>
        &larr; 返回首页
      </Link>
      <article>
        <h1>{post.title}</h1>
        <p style={{ color: '#666', marginTop: '-0.5rem', marginBottom: '1.5rem' }}>
          发布于 {post.createdAt.toLocaleString()}
        </p>
        <div style={{ whiteSpace: 'pre-wrap' }}> {/* pre-wrap 可以保留换行符 */}
          {post.content}
        </div>
      </article>
    </main>
  );
}
