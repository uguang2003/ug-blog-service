/**
 * @description: 后台留言删除接口。
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
    const messageId = parseInt(id);

    await prisma.message.updateMany({
      where: { parentMessageId: messageId },
      data: { parentMessageId: null },
    });
    await prisma.message.delete({ where: { id: messageId } });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除留言失败:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
});
