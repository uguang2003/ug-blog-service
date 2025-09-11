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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      firstPicture,
      flag,
      published,
      recommend,
      typeId,
      userId,
      description,
      appreciation = false,
      shareStatement = false,
      commentabled = true,
    } = body;

    const newBlog = await prisma.blog.create({
      data: {
        title,
        content,
        firstPicture,
        flag,
        published,
        recommend,
        typeId: typeId ? parseInt(typeId) : null,
        userId: userId ? parseInt(userId) : null,
        description,
        appreciation,
        shareStatement,
        commentabled,
        createTime: new Date(),
        updateTime: new Date(),
        views: 0,
        commentCount: 0,
      },
      include: {
        type: true,
        user: true,
      },
    });

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.error('创建博客失败:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
