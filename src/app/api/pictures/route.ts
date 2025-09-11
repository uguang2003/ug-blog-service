import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const pictures = await prisma.picture.findMany({
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(pictures);
  } catch (error) {
    console.error('获取图片失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
