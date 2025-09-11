import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('blogId');
    const parentCommentId = searchParams.get('parentCommentId');

    let where: any = {};

    if (blogId) {
      where.blogId = parseInt(blogId);
    }

    if (parentCommentId) {
      where.parentCommentId = parseInt(parentCommentId);
    } else {
      where.parentCommentId = null; // 获取顶级评论
    }

    const comments = await prisma.comment.findMany({
      where,
      include: {
        replies: {
          include: {
            replies: true,
          },
        },
      },
      orderBy: { createTime: 'desc' },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nickname,
      email,
      content,
      avatar,
      blogId,
      parentCommentId,
      adminComment = false,
    } = body;

    const newComment = await prisma.comment.create({
      data: {
        nickname,
        email,
        content,
        avatar,
        blogId: blogId ? parseInt(blogId) : null,
        parentCommentId: parentCommentId ? parseInt(parentCommentId) : null,
        adminComment,
        createTime: new Date(),
      },
      include: {
        blog: true,
        parentComment: true,
      },
    });

    // 更新博客的评论数量
    if (blogId) {
      await prisma.blog.update({
        where: { id: parseInt(blogId) },
        data: {
          commentCount: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('创建评论失败:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
