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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    const newType = await prisma.type.create({
      data: {
        name,
      },
    });

    return NextResponse.json(newType, { status: 201 });
  } catch (error) {
    console.error('创建分类失败:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
