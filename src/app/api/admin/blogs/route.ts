import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const title = searchParams.get('title');
    const typeId = searchParams.get('typeId');

    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (title) {
      where.title = { contains: title };
    }
    if (typeId) {
      where.typeId = parseInt(typeId);
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        include: {
          type: true,
          user: {
            select: {
              id: true,
              username: true,
              nickname: true,
            },
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { updateTime: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.blog.count({ where }),
    ]);

    return NextResponse.json({
      blogs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('获取博客列表失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
});

export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const {
      title,
      content,
      description,
      firstPicture,
      published = false,
      recommend = false,
      commentabled = true,
      appreciation = false,
      shareStatement = false,
      typeId,
    } = body;

    const user = (request as any).user;

    const newBlog = await prisma.blog.create({
      data: {
        title,
        content,
        description,
        firstPicture,
        published,
        recommend,
        commentabled,
        appreciation,
        shareStatement,
        typeId: parseInt(typeId),
        userId: user.userId,
        createTime: new Date(),
        updateTime: new Date(),
        views: 0,
        commentCount: 0,
      },
      include: {
        type: true,
        user: {
          select: {
            id: true,
            username: true,
            nickname: true,
          },
        },
      },
    });

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.error('创建博客失败:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
});
