import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const [
      blogCount,
      publishedBlogCount,
      commentCount,
      userCount,
      typeCount,
    ] = await Promise.all([
      prisma.blog.count(),
      prisma.blog.count({ where: { published: true } }),
      prisma.comment.count(),
      prisma.user.count(),
      prisma.type.count(),
    ]);

    // 获取最近7天的博客发布统计
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentBlogs = await prisma.blog.findMany({
      where: {
        createTime: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createTime: true,
      },
      orderBy: {
        createTime: 'asc',
      },
    });

    // 按日期分组统计
    const blogStats = recentBlogs.reduce((acc: any, blog) => {
      const date = blog.createTime!.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      totalBlogs: blogCount,
      publishedBlogs: publishedBlogCount,
      totalComments: commentCount,
      totalUsers: userCount,
      totalTypes: typeCount,
      recentBlogStats: blogStats,
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
});
