import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const DELETE = requireAdmin(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const id = parseInt(params.id);

    await prisma.message.delete({
      where: { id },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除留言失败:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
});
