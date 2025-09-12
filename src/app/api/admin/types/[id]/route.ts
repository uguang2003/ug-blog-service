import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const PUT = requireAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const typeId = parseInt(id);
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: '分类名称不能为空' }, { status: 400 });
    }

    const updatedType = await prisma.type.update({
      where: { id: typeId },
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(updatedType);
  } catch (error) {
    console.error('更新分类失败:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const typeId = parseInt(id);

    // 检查是否有博客使用此分类
    const blogCount = await prisma.blog.count({
      where: { typeId: typeId },
    });

    if (blogCount > 0) {
      return NextResponse.json({ error: '该分类下还有博客，无法删除' }, { status: 400 });
    }

    await prisma.type.delete({
      where: { id: typeId },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除分类失败:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
});
