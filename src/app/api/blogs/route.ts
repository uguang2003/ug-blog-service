import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const recommend = searchParams.get('recommend') === 'true';
    const typeId = searchParams.get('typeId');
    const query = searchParams.get('query');

    let where: any = {};

    if (recommend) {
      where.recommend = true;
    }

    if (typeId) {
      where.typeId = parseInt(typeId);
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ];
    }

    const blogs = await prisma.blog.findMany({
      where,
      include: {
        type: true,
        user: true,
      },
      orderBy: { createTime: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.blog.count({ where });

    return NextResponse.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取博客失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
