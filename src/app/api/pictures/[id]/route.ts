import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const picture = await prisma.picture.findUnique({
      where: { id },
    });

    if (!picture) {
      return NextResponse.json({ error: '图片不存在' }, { status: 404 });
    }

    return NextResponse.json(picture);
  } catch (error) {
    console.error('获取图片失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
