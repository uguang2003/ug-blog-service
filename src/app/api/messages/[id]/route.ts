import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const DELETE = requireAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const messageId = parseInt(id);

    await prisma.message.delete({
      where: { id: messageId },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除留言失败:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
});
