import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        type: true,
        user: true,
        comments: {
          include: {
            replies: true,
          },
        },
      },
    });

    if (!blog) {
      return NextResponse.json({ error: '博客不存在' }, { status: 404 });
    }

    // 增加浏览量
    await prisma.blog.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(blog);
  } catch (error) {
    console.error('获取博客失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
