// src/app/page.tsx
import prisma from '@/lib/prisma';
import Link from 'next/link'; // <--- 别忘了导入 Link 组件

// 定义 Post 类型，这样 TypeScript 就能知道 post 对象有哪些属性
interface Post {
  id: number;
  title: string;
  content: string | null;
  createdAt: Date;
  published: boolean;
  updatedAt: Date;
}

export default async function HomePage() {
  const posts: Post[] = await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>我的博客</h1>
      <p>欢迎来到我的博客！这里是最新的文章：</p>
      
      <div style={{ marginTop: '2rem' }}>
        {posts.length > 0 ? (
          <ul>
            {posts.map((post) => (
              <li key={post.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
                
                {/* vvvvvvv  修改这里 vvvvvvv */}
                <Link href={`/posts/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h2 style={{ marginBottom: '0.5rem' }}>{post.title}</h2>
                </Link>
                {/* ^^^^^^^  修改这里 ^^^^^^^ */}
                <p>{post.content?.substring(0, 150)}...</p> {/* 首页只显示摘要 */}
                <small>发布于: {post.createdAt.toLocaleString()}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>还没有任何文章。</p>
        )}
      </div>
    </main>
  );
}
