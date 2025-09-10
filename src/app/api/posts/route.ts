// src/app/api/posts/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // 确保你已经创建了这个 prisma 实例

// 处理 POST 请求 (你已经有的代码)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, published } = body;

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        // published 是可选的，如果前端没传，可以给个默认值
        published: published || false, 
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("创建 Post 失败:", error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

// ----------------------------------------------------
// vvvvvvv  这是我们新加的代码 vvvvvvv
// ----------------------------------------------------

// 处理 GET 请求
export async function GET() {
  try {
    // 使用 Prisma 从数据库中查找所有 post
    const posts = await prisma.post.findMany({
      // 你可以加一些选项，比如按创建时间倒序排列
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 将查询到的文章列表以 JSON 格式返回
    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("获取 Posts 失败:", error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
