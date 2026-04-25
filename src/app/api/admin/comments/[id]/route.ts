/**
 * @description: 后台评论删除接口。删除后维护博客 commentCount。
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const DELETE = requireAdmin(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;
    const commentId = parseInt(id);
    const target = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!target) {
      return NextResponse.json({ error: '评论不存在' }, { status: 404 });
    }

    // 先把子评论的 parent 解开，再删本条
    await prisma.comment.updateMany({
      where: { parentCommentId: commentId },
      data: { parentCommentId: null },
    });
    await prisma.comment.delete({ where: { id: commentId } });

    if (target.blogId !== null) {
      await prisma.blog.update({
        where: { id: target.blogId },
        data: { commentCount: { decrement: 1 } },
      });
    }

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除评论失败:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
});
