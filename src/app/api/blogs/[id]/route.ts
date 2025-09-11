import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        type: true,
        user: true,
        comments: {
          include: {
            replies: true,
          },
        },
      },
    });

    if (!blog) {
      return NextResponse.json({ error: '博客不存在' }, { status: 404 });
    }

    // 增加浏览量
    await prisma.blog.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(blog);
  } catch (error) {
    console.error('获取博客失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const {
      title,
      content,
      firstPicture,
      flag,
      published,
      recommend,
      typeId,
      description,
      appreciation,
      shareStatement,
      commentabled,
    } = body;

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        title,
        content,
        firstPicture,
        flag,
        published,
        recommend,
        typeId: typeId ? parseInt(typeId) : null,
        description,
        appreciation,
        shareStatement,
        commentabled,
        updateTime: new Date(),
      },
      include: {
        type: true,
        user: true,
      },
    });

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error('更新博客失败:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await prisma.blog.delete({
      where: { id },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除博客失败:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
