import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const type = await prisma.type.findUnique({
      where: { id },
      include: {
        blogs: true,
      },
    });

    if (!type) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }

    return NextResponse.json(type);
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
