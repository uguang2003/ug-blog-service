import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const skip = (page - 1) * pageSize;

    const [pictures, total] = await Promise.all([
      prisma.picture.findMany({
        orderBy: { id: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.picture.count(),
    ]);

    return NextResponse.json({
      pictures,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('获取图片列表失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
});

export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { pictureAddress, pictureDescription, pictureName, pictureTime } = body;

    const newPicture = await prisma.picture.create({
      data: {
        pictureAddress,
        pictureDescription,
        pictureName,
        pictureTime,
      },
    });

    return NextResponse.json(newPicture, { status: 201 });
  } catch (error) {
    console.error('创建图片失败:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
});
