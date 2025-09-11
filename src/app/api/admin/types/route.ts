import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const types = await prisma.type.findMany({
      include: {
        _count: {
          select: { blogs: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(types);
  } catch (error) {
    console.error('获取分类列表失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
});

export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: '分类名称不能为空' }, { status: 400 });
    }

    const newType = await prisma.type.create({
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(newType, { status: 201 });
  } catch (error) {
    console.error('创建分类失败:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
});
