import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const DELETE = requireAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const commentId = parseInt(id);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: '评论不存在' }, { status: 404 });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    // 更新博客的评论数量
    if (comment.blogId) {
      await prisma.blog.update({
        where: { id: comment.blogId },
        data: {
          commentCount: {
            decrement: 1,
          },
        },
      });
    }

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除评论失败:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
});
