import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const types = await prisma.type.findMany({
      include: {
        blogs: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(types);
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
