import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const GET = requireAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const blogId = parseInt(id);

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        type: true,
        user: {
          select: {
            id: true,
            username: true,
            nickname: true,
          },
        },
        comments: {
          select: {
            id: true,
            nickname: true,
            email: true,
            content: true,
            avatar: true,
            createTime: true,
            adminComment: true,
          },
          orderBy: { createTime: 'desc' },
        },
      },
    });

    if (!blog) {
      return NextResponse.json({ error: '博客不存在' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('获取博客失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
});

export const PUT = requireAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const blogId = parseInt(id);
    const body = await request.json();
    const {
      title,
      content,
      description,
      firstPicture,
      published,
      recommend,
      commentabled,
      appreciation,
      shareStatement,
      typeId,
    } = body;

    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
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
        updateTime: new Date(),
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

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error('更新博客失败:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const blogId = parseInt(id);

    await prisma.blog.delete({
      where: { id: blogId },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除博客失败:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
});
