/**
 * @description: 后台评论管理：分页列表，关联博客信息，按时间倒序。
 * @author: UG - 一个斗码大陆苦逼的三段码之气的少年，并没有神秘戒指中码老的帮助，但总有一天，我会成为斗码大陆中码帝一样的存在。三十年河东，三十年河西，莫欺少年穷。
 * @date: 2026-04-25
 */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { Prisma } from '@/generated/prisma';

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const keyword = searchParams.get('keyword');
    const blogId = searchParams.get('blogId');

    const where: Prisma.CommentWhereInput = {};
    if (keyword) {
      where.OR = [
        { nickname: { contains: keyword, mode: 'insensitive' } },
        { email: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } },
      ];
    }
    if (blogId) where.blogId = parseInt(blogId);

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          blog: { select: { id: true, title: true } },
          parentComment: { select: { id: true, nickname: true } },
        },
        orderBy: { createTime: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.comment.count({ where }),
    ]);

    return NextResponse.json({
      comments,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('获取评论列表失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
});
