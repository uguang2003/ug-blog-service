import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [blogTotal, blogViewTotal, blogCommentTotal, blogMessageTotal] = await Promise.all([
      prisma.blog.count(),
      prisma.blog.aggregate({
        _sum: {
          views: true,
        },
      }),
      prisma.comment.count(),
      prisma.message.count(),
    ]);

    const stats = {
      blogTotal,
      blogViewTotal: blogViewTotal._sum.views || 0,
      blogCommentTotal,
      blogMessageTotal,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('获取统计信息失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
